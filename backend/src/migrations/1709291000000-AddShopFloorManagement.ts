import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShopFloorManagement1709291000000 implements MigrationInterface {
  name = 'AddShopFloorManagement1709291000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create material_consumption table
    await queryRunner.query(`
      CREATE TABLE "material_consumption" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "job_id" uuid NOT NULL,
        "stage_history_id" uuid,
        "material_name" varchar(100) NOT NULL,
        "material_code" varchar(50),
        "transaction_type" varchar(20) NOT NULL CHECK (transaction_type IN ('issue', 'return')),
        "quantity" decimal(10,2) NOT NULL,
        "unit" varchar(20) NOT NULL,
        "notes" text,
        "issued_by_id" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_material_consumption_job" FOREIGN KEY ("job_id") REFERENCES "production_jobs"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_material_consumption_stage" FOREIGN KEY ("stage_history_id") REFERENCES "production_stage_history"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_material_consumption_user" FOREIGN KEY ("issued_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create machine_counters table
    await queryRunner.query(`
      CREATE TABLE "machine_counters" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "job_id" uuid NOT NULL,
        "stage_history_id" uuid NOT NULL,
        "machine_name" varchar(50) NOT NULL,
        "counter_start" int NOT NULL,
        "counter_end" int,
        "good_quantity" int,
        "waste_quantity" int,
        "notes" text,
        "recorded_by_id" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_machine_counter_job" FOREIGN KEY ("job_id") REFERENCES "production_jobs"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_machine_counter_stage" FOREIGN KEY ("stage_history_id") REFERENCES "production_stage_history"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_machine_counter_user" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create wastage_records table
    await queryRunner.query(`
      CREATE TABLE "wastage_records" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "job_id" uuid NOT NULL,
        "stage_history_id" uuid NOT NULL,
        "wastage_type" varchar(50) NOT NULL CHECK (wastage_type IN ('setup_waste', 'production_waste', 'quality_rejection', 'machine_error', 'material_defect', 'other')),
        "quantity" int NOT NULL,
        "unit" varchar(20) NOT NULL,
        "estimated_cost" decimal(10,2),
        "reason" text,
        "corrective_action" text,
        "recorded_by_id" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_wastage_record_job" FOREIGN KEY ("job_id") REFERENCES "production_jobs"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_wastage_record_stage" FOREIGN KEY ("stage_history_id") REFERENCES "production_stage_history"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_wastage_record_user" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create offline_sync_queue table
    await queryRunner.query(`
      CREATE TABLE "offline_sync_queue" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "action_type" varchar(50) NOT NULL,
        "payload" jsonb NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
        "error_message" text,
        "retry_count" int NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_material_consumption_job" ON "material_consumption"("job_id")`);
    await queryRunner.query(`CREATE INDEX "idx_material_consumption_stage" ON "material_consumption"("stage_history_id")`);
    await queryRunner.query(`CREATE INDEX "idx_machine_counter_job" ON "machine_counters"("job_id")`);
    await queryRunner.query(`CREATE INDEX "idx_machine_counter_stage" ON "machine_counters"("stage_history_id")`);
    await queryRunner.query(`CREATE INDEX "idx_wastage_record_job" ON "wastage_records"("job_id")`);
    await queryRunner.query(`CREATE INDEX "idx_wastage_record_stage" ON "wastage_records"("stage_history_id")`);
    await queryRunner.query(`CREATE INDEX "idx_offline_sync_status" ON "offline_sync_queue"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_offline_sync_user" ON "offline_sync_queue"("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "idx_offline_sync_user"`);
    await queryRunner.query(`DROP INDEX "idx_offline_sync_status"`);
    await queryRunner.query(`DROP INDEX "idx_wastage_record_stage"`);
    await queryRunner.query(`DROP INDEX "idx_wastage_record_job"`);
    await queryRunner.query(`DROP INDEX "idx_machine_counter_stage"`);
    await queryRunner.query(`DROP INDEX "idx_machine_counter_job"`);
    await queryRunner.query(`DROP INDEX "idx_material_consumption_stage"`);
    await queryRunner.query(`DROP INDEX "idx_material_consumption_job"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "offline_sync_queue"`);
    await queryRunner.query(`DROP TABLE "wastage_records"`);
    await queryRunner.query(`DROP TABLE "machine_counters"`);
    await queryRunner.query(`DROP TABLE "material_consumption"`);
  }
}
