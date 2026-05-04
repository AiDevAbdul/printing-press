import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductionWorkflowStagesOnly1773040600000 implements MigrationInterface {
    name = 'AddProductionWorkflowStagesOnly1773040600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table already exists
        const tableExists = await queryRunner.hasTable('production_workflow_stages');

        if (!tableExists) {
            await queryRunner.query(`
                CREATE TYPE "public"."production_workflow_stages_status_enum" AS ENUM('pending', 'in_progress', 'paused', 'completed')
            `);

            await queryRunner.query(`
                CREATE TABLE "production_workflow_stages" (
                    "id" SERIAL NOT NULL,
                    "stage_name" character varying(100) NOT NULL,
                    "stage_order" integer NOT NULL,
                    "status" "public"."production_workflow_stages_status_enum" NOT NULL DEFAULT 'pending',
                    "started_at" TIMESTAMP,
                    "paused_at" TIMESTAMP,
                    "resumed_at" TIMESTAMP,
                    "completed_at" TIMESTAMP,
                    "active_duration_minutes" integer NOT NULL DEFAULT '0',
                    "pause_duration_minutes" integer NOT NULL DEFAULT '0',
                    "total_duration_minutes" integer,
                    "operator_name" character varying(255),
                    "machine" character varying(100),
                    "waste_quantity" numeric(10,2),
                    "notes" text,
                    "pause_reason" character varying(255),
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "job_id" uuid,
                    "operator_id" uuid,
                    CONSTRAINT "PK_5d8f91174ec2bd02caa4cd3872c" PRIMARY KEY ("id")
                )
            `);

            await queryRunner.query(`
                ALTER TABLE "production_workflow_stages"
                ADD CONSTRAINT "FK_2e2dce7b6f9f321a564d76d6fe2"
                FOREIGN KEY ("job_id")
                REFERENCES "production_jobs"("id")
                ON DELETE CASCADE
                ON UPDATE NO ACTION
            `);

            await queryRunner.query(`
                ALTER TABLE "production_workflow_stages"
                ADD CONSTRAINT "FK_8b9caac6bc0d73e6e639248f7a6"
                FOREIGN KEY ("operator_id")
                REFERENCES "users"("id")
                ON DELETE SET NULL
                ON UPDATE NO ACTION
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_workflow_job" ON "production_workflow_stages" ("job_id")
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_workflow_status" ON "production_workflow_stages" ("status")
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_workflow_stage" ON "production_workflow_stages" ("stage_name")
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_workflow_stage"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_workflow_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_workflow_job"`);
        await queryRunner.query(`ALTER TABLE "production_workflow_stages" DROP CONSTRAINT IF EXISTS "FK_8b9caac6bc0d73e6e639248f7a6"`);
        await queryRunner.query(`ALTER TABLE "production_workflow_stages" DROP CONSTRAINT IF EXISTS "FK_2e2dce7b6f9f321a564d76d6fe2"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "production_workflow_stages"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."production_workflow_stages_status_enum"`);
    }
}
