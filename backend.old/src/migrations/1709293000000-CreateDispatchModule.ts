import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDispatchModule1709293000000 implements MigrationInterface {
  name = 'CreateDispatchModule1709293000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create deliveries table
    await queryRunner.query(`
      CREATE TABLE "deliveries" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "delivery_number" varchar(50) UNIQUE NOT NULL,
        "job_id" uuid NOT NULL,
        "customer_id" uuid NOT NULL,
        "delivery_status" varchar(20) NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'packed', 'dispatched', 'in_transit', 'delivered', 'failed', 'returned')),
        "delivery_type" varchar(20) NOT NULL CHECK (delivery_type IN ('courier', 'own_transport', 'customer_pickup')),
        "scheduled_date" date NOT NULL,
        "packed_at" timestamp,
        "dispatched_at" timestamp,
        "delivered_at" timestamp,
        "courier_name" varchar(100),
        "tracking_number" varchar(100),
        "vehicle_number" varchar(50),
        "driver_name" varchar(100),
        "driver_phone" varchar(20),
        "delivery_address" text NOT NULL,
        "delivery_contact_name" varchar(100),
        "delivery_contact_phone" varchar(20),
        "pod_photo_url" varchar(255),
        "pod_signature_url" varchar(255),
        "received_by_name" varchar(100),
        "received_by_designation" varchar(100),
        "delivery_notes" text,
        "failure_reason" text,
        "created_by_id" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_delivery_job" FOREIGN KEY ("job_id") REFERENCES "production_jobs"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_delivery_customer" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_delivery_created_by" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create packing_lists table
    await queryRunner.query(`
      CREATE TABLE "packing_lists" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "delivery_id" uuid NOT NULL,
        "box_number" int NOT NULL,
        "item_description" varchar(200) NOT NULL,
        "quantity" int NOT NULL,
        "unit" varchar(20) NOT NULL,
        "weight_kg" decimal(10,2),
        "notes" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_packing_list_delivery" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE CASCADE
      )
    `);

    // Create challans table
    await queryRunner.query(`
      CREATE TABLE "challans" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "challan_number" varchar(50) UNIQUE NOT NULL,
        "delivery_id" uuid NOT NULL,
        "challan_date" date NOT NULL,
        "terms_and_conditions" text,
        "notes" text,
        "generated_by_id" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_challan_delivery" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_challan_generated_by" FOREIGN KEY ("generated_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create delivery_tracking table
    await queryRunner.query(`
      CREATE TABLE "delivery_tracking" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "delivery_id" uuid NOT NULL,
        "status" varchar(100) NOT NULL,
        "location" varchar(200),
        "notes" text,
        "updated_by_id" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "fk_tracking_delivery" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_tracking_updated_by" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_delivery_job" ON "deliveries"("job_id")`);
    await queryRunner.query(`CREATE INDEX "idx_delivery_customer" ON "deliveries"("customer_id")`);
    await queryRunner.query(`CREATE INDEX "idx_delivery_status" ON "deliveries"("delivery_status")`);
    await queryRunner.query(`CREATE INDEX "idx_delivery_scheduled_date" ON "deliveries"("scheduled_date")`);
    await queryRunner.query(`CREATE INDEX "idx_packing_list_delivery" ON "packing_lists"("delivery_id")`);
    await queryRunner.query(`CREATE INDEX "idx_challan_delivery" ON "challans"("delivery_id")`);
    await queryRunner.query(`CREATE INDEX "idx_tracking_delivery" ON "delivery_tracking"("delivery_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "idx_tracking_delivery"`);
    await queryRunner.query(`DROP INDEX "idx_challan_delivery"`);
    await queryRunner.query(`DROP INDEX "idx_packing_list_delivery"`);
    await queryRunner.query(`DROP INDEX "idx_delivery_scheduled_date"`);
    await queryRunner.query(`DROP INDEX "idx_delivery_status"`);
    await queryRunner.query(`DROP INDEX "idx_delivery_customer"`);
    await queryRunner.query(`DROP INDEX "idx_delivery_job"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "delivery_tracking"`);
    await queryRunner.query(`DROP TABLE "challans"`);
    await queryRunner.query(`DROP TABLE "packing_lists"`);
    await queryRunner.query(`DROP TABLE "deliveries"`);
  }
}
