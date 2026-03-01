import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhanceProductionTracking1709287300000 implements MigrationInterface {
    name = 'EnhanceProductionTracking1709287300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns to production_jobs table
        await queryRunner.query(`
            ALTER TABLE "production_jobs"
            ADD COLUMN "queue_position" INTEGER,
            ADD COLUMN "current_stage" VARCHAR(100),
            ADD COLUMN "current_process" VARCHAR(100),
            ADD COLUMN "inline_status" VARCHAR(255),
            ADD COLUMN "searchable_text" TEXT,
            ADD COLUMN "estimated_start" TIMESTAMP,
            ADD COLUMN "estimated_completion" TIMESTAMP,
            ADD COLUMN "actual_completion" TIMESTAMP,
            ADD COLUMN "progress_percent" INTEGER DEFAULT 0
        `);

        // Create production_stage_history table
        await queryRunner.query(`
            CREATE TABLE "production_stage_history" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "job_id" uuid NOT NULL,
                "stage" VARCHAR(100) NOT NULL,
                "process" VARCHAR(100),
                "machine" VARCHAR(50),
                "operator_id" uuid,
                "started_at" TIMESTAMP NOT NULL DEFAULT now(),
                "completed_at" TIMESTAMP,
                "duration_minutes" INTEGER,
                "notes" TEXT,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_stage_history_job" FOREIGN KEY ("job_id")
                    REFERENCES "production_jobs"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_stage_history_operator" FOREIGN KEY ("operator_id")
                    REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        // Add indexes for search performance
        await queryRunner.query(`
            CREATE INDEX "IDX_production_current_stage" ON "production_jobs" ("current_stage")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_production_machine" ON "production_jobs" ("assigned_machine")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_production_status" ON "production_jobs" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_stage_history_job" ON "production_stage_history" ("job_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_stage_history_stage" ON "production_stage_history" ("stage")
        `);

        // Update existing jobs with default inline_status
        await queryRunner.query(`
            UPDATE "production_jobs"
            SET "inline_status" =
                CASE
                    WHEN "status" = 'queued' THEN 'Queued - Waiting to Start'
                    WHEN "status" = 'in_progress' THEN 'In Production'
                    WHEN "status" = 'paused' THEN 'Paused'
                    WHEN "status" = 'completed' THEN 'Completed'
                    WHEN "status" = 'cancelled' THEN 'Cancelled'
                    ELSE 'Unknown'
                END
            WHERE "inline_status" IS NULL
        `);

        // Update searchable_text for existing jobs
        await queryRunner.query(`
            UPDATE "production_jobs" pj
            SET "searchable_text" =
                COALESCE(pj."job_number", '') || ' ' ||
                COALESCE(pj."assigned_machine", '') || ' ' ||
                COALESCE(pj."inline_status", '')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_stage_history_stage"`);
        await queryRunner.query(`DROP INDEX "IDX_stage_history_job"`);
        await queryRunner.query(`DROP INDEX "IDX_production_status"`);
        await queryRunner.query(`DROP INDEX "IDX_production_machine"`);
        await queryRunner.query(`DROP INDEX "IDX_production_current_stage"`);

        // Drop production_stage_history table
        await queryRunner.query(`DROP TABLE "production_stage_history"`);

        // Drop new columns from production_jobs
        await queryRunner.query(`
            ALTER TABLE "production_jobs"
            DROP COLUMN "progress_percent",
            DROP COLUMN "actual_completion",
            DROP COLUMN "estimated_completion",
            DROP COLUMN "estimated_start",
            DROP COLUMN "searchable_text",
            DROP COLUMN "inline_status",
            DROP COLUMN "current_process",
            DROP COLUMN "current_stage",
            DROP COLUMN "queue_position"
        `);
    }
}
