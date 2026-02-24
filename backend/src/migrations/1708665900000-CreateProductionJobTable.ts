import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductionJobTable1708665900000 implements MigrationInterface {
    name = 'CreateProductionJobTable1708665900000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "production_job_status_enum" AS ENUM('queued', 'in_progress', 'paused', 'completed', 'cancelled')
        `);

        await queryRunner.query(`
            CREATE TABLE "production_jobs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "job_number" character varying NOT NULL,
                "order_id" uuid NOT NULL,
                "scheduled_start_date" date,
                "scheduled_end_date" date,
                "actual_start_date" TIMESTAMP,
                "actual_end_date" TIMESTAMP,
                "status" "production_job_status_enum" NOT NULL DEFAULT 'queued',
                "assigned_machine" character varying,
                "assigned_operator" uuid,
                "estimated_hours" decimal(10,2),
                "actual_hours" decimal(10,2),
                "notes" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_job_number" UNIQUE ("job_number"),
                CONSTRAINT "PK_production_jobs" PRIMARY KEY ("id"),
                CONSTRAINT "FK_production_job_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT,
                CONSTRAINT "FK_production_job_operator" FOREIGN KEY ("assigned_operator") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_production_job_status" ON "production_jobs" ("status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_production_job_order" ON "production_jobs" ("order_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_production_job_scheduled_start" ON "production_jobs" ("scheduled_start_date")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_production_job_scheduled_start"`);
        await queryRunner.query(`DROP INDEX "IDX_production_job_order"`);
        await queryRunner.query(`DROP INDEX "IDX_production_job_status"`);
        await queryRunner.query(`DROP TABLE "production_jobs"`);
        await queryRunner.query(`DROP TYPE "production_job_status_enum"`);
    }
}
