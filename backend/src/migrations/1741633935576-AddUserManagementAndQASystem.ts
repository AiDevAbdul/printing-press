import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserManagementAndQASystem1741633935576 implements MigrationInterface {
    name = 'AddUserManagementAndQASystem1741633935576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Update user_role_enum to include new roles
        // First check if enum exists, if not create it
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
                    CREATE TYPE "user_role_enum" AS ENUM('admin', 'sales', 'planner', 'accounts', 'inventory', 'qa_manager', 'operator', 'analyst');
                ELSE
                    ALTER TYPE "user_role_enum" ADD VALUE IF NOT EXISTS 'qa_manager';
                    ALTER TYPE "user_role_enum" ADD VALUE IF NOT EXISTS 'operator';
                    ALTER TYPE "user_role_enum" ADD VALUE IF NOT EXISTS 'analyst';
                END IF;
            END $$;
        `);

        // 2. Add new columns to users table
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "phone" character varying,
            ADD COLUMN "department" character varying,
            ADD COLUMN "bio" text,
            ADD COLUMN "avatar_url" character varying,
            ADD COLUMN "system_access" jsonb DEFAULT '[]'::jsonb,
            ADD COLUMN "partial_access" jsonb DEFAULT '{}'::jsonb,
            ADD COLUMN "substitute_user_id" uuid,
            ADD COLUMN "substitute_start_date" date,
            ADD COLUMN "substitute_end_date" date,
            ADD COLUMN "substitute_reason" text
        `);

        // 3. Add foreign key for substitute_user_id
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_users_substitute_user"
            FOREIGN KEY ("substitute_user_id")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

        // 4. Create stage_approvals table
        await queryRunner.query(`
            CREATE TYPE "approval_status_enum" AS ENUM('pending', 'approved', 'rejected')
        `);

        await queryRunner.query(`
            CREATE TABLE "stage_approvals" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "inline_item_id" integer,
                "job_id" uuid,
                "stage_name" character varying NOT NULL,
                "status" "approval_status_enum" NOT NULL DEFAULT 'pending',
                "approved_by" uuid,
                "approved_at" TIMESTAMP,
                "rejection_reason" text,
                "notes" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_stage_approvals" PRIMARY KEY ("id")
            )
        `);

        // 5. Add foreign keys for stage_approvals
        await queryRunner.query(`
            ALTER TABLE "stage_approvals"
            ADD CONSTRAINT "FK_stage_approvals_approved_by"
            FOREIGN KEY ("approved_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "stage_approvals"
            ADD CONSTRAINT "FK_stage_approvals_job"
            FOREIGN KEY ("job_id")
            REFERENCES "production_jobs"("id")
            ON DELETE CASCADE
        `);

        // 6. Create notifications table
        await queryRunner.query(`
            CREATE TYPE "notification_type_enum" AS ENUM(
                'approval_request',
                'stage_approved',
                'stage_rejected',
                'stage_assigned',
                'substitute_assigned',
                'general'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "notifications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "type" "notification_type_enum" NOT NULL,
                "title" character varying NOT NULL,
                "message" text NOT NULL,
                "link" character varying,
                "read" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
            )
        `);

        // 7. Add foreign key for notifications
        await queryRunner.query(`
            ALTER TABLE "notifications"
            ADD CONSTRAINT "FK_notifications_user"
            FOREIGN KEY ("user_id")
            REFERENCES "users"("id")
            ON DELETE CASCADE
        `);

        // 8. Create user_activity_log table
        await queryRunner.query(`
            CREATE TABLE "user_activity_log" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "action" character varying NOT NULL,
                "entity_type" character varying,
                "entity_id" character varying,
                "details" jsonb,
                "ip_address" character varying,
                "user_agent" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_user_activity_log" PRIMARY KEY ("id")
            )
        `);

        // 9. Add foreign key for user_activity_log
        await queryRunner.query(`
            ALTER TABLE "user_activity_log"
            ADD CONSTRAINT "FK_user_activity_log_user"
            FOREIGN KEY ("user_id")
            REFERENCES "users"("id")
            ON DELETE CASCADE
        `);

        // 10. Add QA approval fields to production_workflow_stages
        await queryRunner.query(`
            ALTER TABLE "production_workflow_stages"
            ADD COLUMN "qa_approval_required" boolean NOT NULL DEFAULT true,
            ADD COLUMN "qa_approval_status" "approval_status_enum" DEFAULT 'pending',
            ADD COLUMN "qa_approved_by" uuid,
            ADD COLUMN "qa_approved_at" TIMESTAMP,
            ADD COLUMN "qa_rejection_reason" text
        `);

        // 11. Add foreign key for qa_approved_by
        await queryRunner.query(`
            ALTER TABLE "production_workflow_stages"
            ADD CONSTRAINT "FK_workflow_stages_qa_approved_by"
            FOREIGN KEY ("qa_approved_by")
            REFERENCES "users"("id")
            ON DELETE SET NULL
        `);

        // 12. Create indexes for performance
        await queryRunner.query(`
            CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id");
            CREATE INDEX "IDX_notifications_read" ON "notifications" ("read");
            CREATE INDEX "IDX_notifications_created_at" ON "notifications" ("created_at");
            CREATE INDEX "IDX_stage_approvals_status" ON "stage_approvals" ("status");
            CREATE INDEX "IDX_stage_approvals_job_id" ON "stage_approvals" ("job_id");
            CREATE INDEX "IDX_user_activity_log_user_id" ON "user_activity_log" ("user_id");
            CREATE INDEX "IDX_user_activity_log_created_at" ON "user_activity_log" ("created_at");
            CREATE INDEX "IDX_workflow_stages_qa_approval_status" ON "production_workflow_stages" ("qa_approval_status");
        `);

        // 13. Set default system_access for existing users based on role
        await queryRunner.query(`
            UPDATE "users"
            SET "system_access" = '["Dashboard", "Orders", "Quotations", "Production", "Quality", "Dispatch", "Inventory", "Invoices", "Reports", "Settings"]'::jsonb
            WHERE "role" = 'admin'
        `);

        await queryRunner.query(`
            UPDATE "users"
            SET "system_access" = '["Dashboard", "Orders", "Quotations", "Invoices"]'::jsonb
            WHERE "role" = 'sales'
        `);

        await queryRunner.query(`
            UPDATE "users"
            SET "system_access" = '["Dashboard", "Orders", "Production", "Dispatch"]'::jsonb
            WHERE "role" = 'planner'
        `);

        await queryRunner.query(`
            UPDATE "users"
            SET "system_access" = '["Dashboard", "Invoices", "Reports"]'::jsonb
            WHERE "role" = 'accounts'
        `);

        await queryRunner.query(`
            UPDATE "users"
            SET "system_access" = '["Dashboard", "Inventory", "Orders"]'::jsonb
            WHERE "role" = 'inventory'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_workflow_stages_qa_approval_status"`);
        await queryRunner.query(`DROP INDEX "IDX_user_activity_log_created_at"`);
        await queryRunner.query(`DROP INDEX "IDX_user_activity_log_user_id"`);
        await queryRunner.query(`DROP INDEX "IDX_stage_approvals_job_id"`);
        await queryRunner.query(`DROP INDEX "IDX_stage_approvals_status"`);
        await queryRunner.query(`DROP INDEX "IDX_notifications_created_at"`);
        await queryRunner.query(`DROP INDEX "IDX_notifications_read"`);
        await queryRunner.query(`DROP INDEX "IDX_notifications_user_id"`);

        // Drop foreign keys and columns from production_workflow_stages
        await queryRunner.query(`ALTER TABLE "production_workflow_stages" DROP CONSTRAINT "FK_workflow_stages_qa_approved_by"`);
        await queryRunner.query(`
            ALTER TABLE "production_workflow_stages"
            DROP COLUMN "qa_rejection_reason",
            DROP COLUMN "qa_approved_at",
            DROP COLUMN "qa_approved_by",
            DROP COLUMN "qa_approval_status",
            DROP COLUMN "qa_approval_required"
        `);

        // Drop user_activity_log table
        await queryRunner.query(`ALTER TABLE "user_activity_log" DROP CONSTRAINT "FK_user_activity_log_user"`);
        await queryRunner.query(`DROP TABLE "user_activity_log"`);

        // Drop notifications table
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_user"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "notification_type_enum"`);

        // Drop stage_approvals table
        await queryRunner.query(`ALTER TABLE "stage_approvals" DROP CONSTRAINT "FK_stage_approvals_job"`);
        await queryRunner.query(`ALTER TABLE "stage_approvals" DROP CONSTRAINT "FK_stage_approvals_approved_by"`);
        await queryRunner.query(`DROP TABLE "stage_approvals"`);
        await queryRunner.query(`DROP TYPE "approval_status_enum"`);

        // Drop new columns from users table
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_substitute_user"`);
        await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "substitute_reason",
            DROP COLUMN "substitute_end_date",
            DROP COLUMN "substitute_start_date",
            DROP COLUMN "substitute_user_id",
            DROP COLUMN "partial_access",
            DROP COLUMN "system_access",
            DROP COLUMN "avatar_url",
            DROP COLUMN "bio",
            DROP COLUMN "department",
            DROP COLUMN "phone"
        `);

        // Note: Cannot remove enum values in PostgreSQL, would need to recreate the enum
        // This is acceptable as the values won't cause issues
    }
}
