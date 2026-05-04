import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQualityModule1709292000000 implements MigrationInterface {
  name = 'CreateQualityModule1709292000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create quality_checkpoints table
    await queryRunner.query(`
      CREATE TABLE "quality_checkpoints" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL,
        "description" text,
        "stage" varchar(50) NOT NULL CHECK (stage IN ('pre_press', 'printing', 'lamination', 'uv_coating', 'die_cutting', 'pasting', 'final_inspection')),
        "severity" varchar(20) NOT NULL DEFAULT 'mandatory' CHECK (severity IN ('optional', 'mandatory', 'critical')),
        "checklist_items" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "sequence_order" int NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create quality_inspections table
    await queryRunner.query(`
      CREATE TABLE "quality_inspections" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "inspection_number" varchar(50) UNIQUE NOT NULL,
        "job_id" uuid NOT NULL,
        "stage_history_id" uuid,
        "checkpoint_id" uuid NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed', 'failed')),
        "sample_size" int,
        "defects_found" int,
        "checklist_results" jsonb,
        "notes" text,
        "failure_reason" text,
        "inspector_id" uuid NOT NULL,
        "inspected_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_inspection_job" FOREIGN KEY ("job_id") REFERENCES "production_jobs"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_inspection_stage" FOREIGN KEY ("stage_history_id") REFERENCES "production_stage_history"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_inspection_checkpoint" FOREIGN KEY ("checkpoint_id") REFERENCES "quality_checkpoints"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_inspection_inspector" FOREIGN KEY ("inspector_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create quality_defects table
    await queryRunner.query(`
      CREATE TABLE "quality_defects" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "inspection_id" uuid NOT NULL,
        "category" varchar(50) NOT NULL CHECK (category IN ('printing', 'color_mismatch', 'registration', 'die_cutting', 'lamination', 'pasting', 'material', 'finishing', 'other')),
        "severity" varchar(20) NOT NULL CHECK (severity IN ('minor', 'major', 'critical')),
        "description" varchar(200) NOT NULL,
        "quantity" int NOT NULL DEFAULT 1,
        "photo_url" varchar(255),
        "root_cause" text,
        "corrective_action" text,
        "logged_by_id" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_defect_inspection" FOREIGN KEY ("inspection_id") REFERENCES "quality_inspections"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_defect_logged_by" FOREIGN KEY ("logged_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create quality_rejections table
    await queryRunner.query(`
      CREATE TABLE "quality_rejections" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "rejection_number" varchar(50) UNIQUE NOT NULL,
        "job_id" uuid NOT NULL,
        "rejected_quantity" int NOT NULL,
        "unit" varchar(20) NOT NULL,
        "reason" text NOT NULL,
        "disposition" varchar(50) NOT NULL CHECK (disposition IN ('scrap', 'rework', 'use_as_is', 'return_to_vendor')),
        "estimated_loss" decimal(10,2),
        "corrective_action" text,
        "is_resolved" boolean NOT NULL DEFAULT false,
        "resolved_at" timestamp,
        "rejected_by_id" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_rejection_job" FOREIGN KEY ("job_id") REFERENCES "production_jobs"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_rejection_rejected_by" FOREIGN KEY ("rejected_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create customer_complaints table
    await queryRunner.query(`
      CREATE TABLE "customer_complaints" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "complaint_number" varchar(50) UNIQUE NOT NULL,
        "customer_id" uuid NOT NULL,
        "job_id" uuid,
        "subject" varchar(200) NOT NULL,
        "description" text NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
        "severity" varchar(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        "photo_url" varchar(255),
        "root_cause_analysis" text,
        "corrective_action" text,
        "preventive_action" text,
        "resolution_notes" text,
        "resolved_at" timestamp,
        "assigned_to_id" uuid,
        "created_by_id" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_complaint_customer" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_complaint_job" FOREIGN KEY ("job_id") REFERENCES "production_jobs"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_complaint_assigned_to" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_complaint_created_by" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Add quality tracking fields to production_jobs table
    await queryRunner.query(`
      ALTER TABLE "production_jobs"
      ADD COLUMN "quality_status" varchar(20),
      ADD COLUMN "failed_inspections_count" int DEFAULT 0,
      ADD COLUMN "last_inspection_date" timestamp
    `);

    // Add quality tracking fields to production_stage_history table
    await queryRunner.query(`
      ALTER TABLE "production_stage_history"
      ADD COLUMN "quality_checked" boolean DEFAULT false,
      ADD COLUMN "quality_status" varchar(20)
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_checkpoint_stage" ON "quality_checkpoints"("stage")`);
    await queryRunner.query(`CREATE INDEX "idx_checkpoint_active" ON "quality_checkpoints"("is_active")`);
    await queryRunner.query(`CREATE INDEX "idx_inspection_job" ON "quality_inspections"("job_id")`);
    await queryRunner.query(`CREATE INDEX "idx_inspection_status" ON "quality_inspections"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_inspection_checkpoint" ON "quality_inspections"("checkpoint_id")`);
    await queryRunner.query(`CREATE INDEX "idx_defect_inspection" ON "quality_defects"("inspection_id")`);
    await queryRunner.query(`CREATE INDEX "idx_defect_category" ON "quality_defects"("category")`);
    await queryRunner.query(`CREATE INDEX "idx_rejection_job" ON "quality_rejections"("job_id")`);
    await queryRunner.query(`CREATE INDEX "idx_rejection_resolved" ON "quality_rejections"("is_resolved")`);
    await queryRunner.query(`CREATE INDEX "idx_complaint_customer" ON "customer_complaints"("customer_id")`);
    await queryRunner.query(`CREATE INDEX "idx_complaint_status" ON "customer_complaints"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_complaint_severity" ON "customer_complaints"("severity")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "idx_complaint_severity"`);
    await queryRunner.query(`DROP INDEX "idx_complaint_status"`);
    await queryRunner.query(`DROP INDEX "idx_complaint_customer"`);
    await queryRunner.query(`DROP INDEX "idx_rejection_resolved"`);
    await queryRunner.query(`DROP INDEX "idx_rejection_job"`);
    await queryRunner.query(`DROP INDEX "idx_defect_category"`);
    await queryRunner.query(`DROP INDEX "idx_defect_inspection"`);
    await queryRunner.query(`DROP INDEX "idx_inspection_checkpoint"`);
    await queryRunner.query(`DROP INDEX "idx_inspection_status"`);
    await queryRunner.query(`DROP INDEX "idx_inspection_job"`);
    await queryRunner.query(`DROP INDEX "idx_checkpoint_active"`);
    await queryRunner.query(`DROP INDEX "idx_checkpoint_stage"`);

    // Remove columns from production tables
    await queryRunner.query(`
      ALTER TABLE "production_stage_history"
      DROP COLUMN "quality_checked",
      DROP COLUMN "quality_status"
    `);

    await queryRunner.query(`
      ALTER TABLE "production_jobs"
      DROP COLUMN "quality_status",
      DROP COLUMN "failed_inspections_count",
      DROP COLUMN "last_inspection_date"
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE "customer_complaints"`);
    await queryRunner.query(`DROP TABLE "quality_rejections"`);
    await queryRunner.query(`DROP TABLE "quality_defects"`);
    await queryRunner.query(`DROP TABLE "quality_inspections"`);
    await queryRunner.query(`DROP TABLE "quality_checkpoints"`);
  }
}
