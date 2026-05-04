import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhanceJobCosting1709287200000 implements MigrationInterface {
    name = 'EnhanceJobCosting1709287200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add product specification fields
        await queryRunner.query(`
            ALTER TABLE "job_costs"
            ADD COLUMN "order_id" uuid,
            ADD COLUMN "card_length" DECIMAL(10,2),
            ADD COLUMN "card_width" DECIMAL(10,2),
            ADD COLUMN "card_gsm" INTEGER,
            ADD COLUMN "card_type" VARCHAR(50),
            ADD COLUMN "colors_cmyk" BOOLEAN DEFAULT false,
            ADD COLUMN "special_colors_count" INTEGER DEFAULT 0,
            ADD COLUMN "special_colors" TEXT,
            ADD COLUMN "uv_type" VARCHAR(50),
            ADD COLUMN "lamination_required" BOOLEAN DEFAULT false,
            ADD COLUMN "embossing_required" BOOLEAN DEFAULT false
        `);

        // Add calculated cost breakdown fields
        await queryRunner.query(`
            ALTER TABLE "job_costs"
            ADD COLUMN "material_cost" DECIMAL(10,2) DEFAULT 0,
            ADD COLUMN "printing_cost_cmyk" DECIMAL(10,2) DEFAULT 0,
            ADD COLUMN "printing_cost_special" DECIMAL(10,2) DEFAULT 0,
            ADD COLUMN "uv_cost" DECIMAL(10,2) DEFAULT 0,
            ADD COLUMN "lamination_cost" DECIMAL(10,2) DEFAULT 0,
            ADD COLUMN "die_cutting_cost" DECIMAL(10,2) DEFAULT 0,
            ADD COLUMN "embossing_cost" DECIMAL(10,2) DEFAULT 0,
            ADD COLUMN "pre_press_charges" DECIMAL(10,2) DEFAULT 0,
            ADD COLUMN "total_processing_cost" DECIMAL(10,2) DEFAULT 0,
            ADD COLUMN "cost_per_unit" DECIMAL(10,4) DEFAULT 0
        `);

        // Add foreign key to orders table
        await queryRunner.query(`
            ALTER TABLE "job_costs"
            ADD CONSTRAINT "FK_job_costs_order"
            FOREIGN KEY ("order_id")
            REFERENCES "orders"("id")
            ON DELETE SET NULL
        `);

        // Add index for order_id
        await queryRunner.query(`
            CREATE INDEX "IDX_job_costs_order" ON "job_costs" ("order_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index
        await queryRunner.query(`DROP INDEX "IDX_job_costs_order"`);

        // Drop foreign key
        await queryRunner.query(`
            ALTER TABLE "job_costs"
            DROP CONSTRAINT "FK_job_costs_order"
        `);

        // Drop all new columns
        await queryRunner.query(`
            ALTER TABLE "job_costs"
            DROP COLUMN "cost_per_unit",
            DROP COLUMN "total_processing_cost",
            DROP COLUMN "pre_press_charges",
            DROP COLUMN "embossing_cost",
            DROP COLUMN "die_cutting_cost",
            DROP COLUMN "lamination_cost",
            DROP COLUMN "uv_cost",
            DROP COLUMN "printing_cost_special",
            DROP COLUMN "printing_cost_cmyk",
            DROP COLUMN "material_cost",
            DROP COLUMN "embossing_required",
            DROP COLUMN "lamination_required",
            DROP COLUMN "uv_type",
            DROP COLUMN "special_colors",
            DROP COLUMN "special_colors_count",
            DROP COLUMN "colors_cmyk",
            DROP COLUMN "card_type",
            DROP COLUMN "card_gsm",
            DROP COLUMN "card_width",
            DROP COLUMN "card_length",
            DROP COLUMN "order_id"
        `);
    }
}
