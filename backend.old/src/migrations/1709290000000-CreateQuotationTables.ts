import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuotationTables1709290000000 implements MigrationInterface {
  name = 'CreateQuotationTables1709290000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create quotations table
    await queryRunner.query(`
      CREATE TABLE "quotations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "quotation_number" character varying NOT NULL,
        "version" integer NOT NULL DEFAULT 1,
        "parent_quotation_id" uuid,
        "status" character varying NOT NULL DEFAULT 'draft',
        "customer_id" uuid NOT NULL,
        "quotation_date" date NOT NULL,
        "valid_until" date NOT NULL,
        "product_name" character varying NOT NULL,
        "product_type" character varying NOT NULL DEFAULT 'cpp_carton',
        "quantity" numeric(10,2) NOT NULL,
        "unit" character varying NOT NULL,
        "length" numeric(10,2),
        "width" numeric(10,2),
        "height" numeric(10,2),
        "dimension_unit" character varying,
        "paper_type" character varying,
        "gsm" integer,
        "board_quality" character varying,
        "color_front" integer NOT NULL DEFAULT 0,
        "color_back" integer NOT NULL DEFAULT 0,
        "pantone_p1" boolean NOT NULL DEFAULT false,
        "pantone_p1_code" character varying,
        "pantone_p2" boolean NOT NULL DEFAULT false,
        "pantone_p2_code" character varying,
        "pantone_p3" boolean NOT NULL DEFAULT false,
        "pantone_p3_code" character varying,
        "pantone_p4" boolean NOT NULL DEFAULT false,
        "pantone_p4_code" character varying,
        "varnish_type" character varying NOT NULL DEFAULT 'none',
        "lamination_type" character varying NOT NULL DEFAULT 'none',
        "embossing" boolean NOT NULL DEFAULT false,
        "embossing_details" character varying,
        "foiling" boolean NOT NULL DEFAULT false,
        "foiling_details" character varying,
        "die_cutting" boolean NOT NULL DEFAULT false,
        "die_cutting_details" character varying,
        "pasting" boolean NOT NULL DEFAULT false,
        "pasting_details" character varying,
        "ctp_required" boolean NOT NULL DEFAULT false,
        "ctp_details" character varying,
        "die_type" character varying,
        "plate_reference" character varying,
        "cylinder_size" numeric(10,2),
        "foil_thickness" numeric(10,2),
        "tablet_size" character varying,
        "punch_size" character varying,
        "material_cost" numeric(10,2) NOT NULL DEFAULT 0,
        "printing_cost" numeric(10,2) NOT NULL DEFAULT 0,
        "finishing_cost" numeric(10,2) NOT NULL DEFAULT 0,
        "pre_press_cost" numeric(10,2) NOT NULL DEFAULT 0,
        "overhead_cost" numeric(10,2) NOT NULL DEFAULT 0,
        "subtotal" numeric(10,2) NOT NULL DEFAULT 0,
        "profit_margin_percent" numeric(5,2) NOT NULL DEFAULT 20,
        "profit_margin_amount" numeric(10,2) NOT NULL DEFAULT 0,
        "discount_percent" numeric(5,2) NOT NULL DEFAULT 0,
        "discount_amount" numeric(10,2) NOT NULL DEFAULT 0,
        "tax_percent" numeric(5,2) NOT NULL DEFAULT 18,
        "tax_amount" numeric(10,2) NOT NULL DEFAULT 0,
        "total_amount" numeric(10,2) NOT NULL DEFAULT 0,
        "notes" text,
        "terms_and_conditions" text,
        "converted_to_order_id" uuid,
        "converted_at" timestamp,
        "created_by_id" uuid NOT NULL,
        "sent_at" timestamp,
        "approved_at" timestamp,
        "rejected_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_quotation_number" UNIQUE ("quotation_number"),
        CONSTRAINT "PK_quotations" PRIMARY KEY ("id")
      )
    `);

    // Create quotation_items table
    await queryRunner.query(`
      CREATE TABLE "quotation_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "quotation_id" uuid NOT NULL,
        "description" character varying NOT NULL,
        "quantity" numeric(10,2) NOT NULL,
        "unit" character varying NOT NULL,
        "unit_price" numeric(10,2) NOT NULL,
        "total_price" numeric(10,2) NOT NULL,
        "notes" text,
        CONSTRAINT "PK_quotation_items" PRIMARY KEY ("id")
      )
    `);

    // Create quotation_history table
    await queryRunner.query(`
      CREATE TABLE "quotation_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "quotation_id" uuid NOT NULL,
        "old_status" character varying NOT NULL,
        "new_status" character varying NOT NULL,
        "notes" text,
        "changed_by_id" uuid NOT NULL,
        "changed_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_quotation_history" PRIMARY KEY ("id")
      )
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "quotations"
      ADD CONSTRAINT "FK_quotations_customer"
      FOREIGN KEY ("customer_id") REFERENCES "customers"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "quotations"
      ADD CONSTRAINT "FK_quotations_created_by"
      FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "quotations"
      ADD CONSTRAINT "FK_quotations_converted_to_order"
      FOREIGN KEY ("converted_to_order_id") REFERENCES "orders"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "quotation_items"
      ADD CONSTRAINT "FK_quotation_items_quotation"
      FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "quotation_history"
      ADD CONSTRAINT "FK_quotation_history_quotation"
      FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "quotation_history"
      ADD CONSTRAINT "FK_quotation_history_changed_by"
      FOREIGN KEY ("changed_by_id") REFERENCES "users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_quotations_customer_id" ON "quotations" ("customer_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_quotations_status" ON "quotations" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_quotations_quotation_date" ON "quotations" ("quotation_date")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_quotation_items_quotation_id" ON "quotation_items" ("quotation_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_quotation_history_quotation_id" ON "quotation_history" ("quotation_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_quotation_history_quotation_id"`);
    await queryRunner.query(`DROP INDEX "IDX_quotation_items_quotation_id"`);
    await queryRunner.query(`DROP INDEX "IDX_quotations_quotation_date"`);
    await queryRunner.query(`DROP INDEX "IDX_quotations_status"`);
    await queryRunner.query(`DROP INDEX "IDX_quotations_customer_id"`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "quotation_history" DROP CONSTRAINT "FK_quotation_history_changed_by"`);
    await queryRunner.query(`ALTER TABLE "quotation_history" DROP CONSTRAINT "FK_quotation_history_quotation"`);
    await queryRunner.query(`ALTER TABLE "quotation_items" DROP CONSTRAINT "FK_quotation_items_quotation"`);
    await queryRunner.query(`ALTER TABLE "quotations" DROP CONSTRAINT "FK_quotations_converted_to_order"`);
    await queryRunner.query(`ALTER TABLE "quotations" DROP CONSTRAINT "FK_quotations_created_by"`);
    await queryRunner.query(`ALTER TABLE "quotations" DROP CONSTRAINT "FK_quotations_customer"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "quotation_history"`);
    await queryRunner.query(`DROP TABLE "quotation_items"`);
    await queryRunner.query(`DROP TABLE "quotations"`);
  }
}
