import { MigrationInterface, QueryRunner } from "typeorm";

export class ExpandPrePressSection1741873752000 implements MigrationInterface {
    name = 'ExpandPrePressSection1741873752000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enums for new Pre-Press fields
        await queryRunner.query(`
            CREATE TYPE "design_file_status_enum" AS ENUM('not_received', 'received', 'approved', 'rejected', 'revision_needed')
        `);

        await queryRunner.query(`
            CREATE TYPE "color_separation_type_enum" AS ENUM('cmyk', 'spot_colors', 'rgb', 'pantone')
        `);

        await queryRunner.query(`
            CREATE TYPE "plate_material_enum" AS ENUM('aluminum', 'polyester', 'steel')
        `);

        await queryRunner.query(`
            CREATE TYPE "plate_condition_enum" AS ENUM('new', 'reused', 'refurbished')
        `);

        await queryRunner.query(`
            CREATE TYPE "plate_approval_status_enum" AS ENUM('pending', 'approved', 'rejected')
        `);

        await queryRunner.query(`
            CREATE TYPE "proof_status_enum" AS ENUM('not_required', 'pending', 'sent', 'approved', 'rejected')
        `);

        await queryRunner.query(`
            CREATE TYPE "color_matching_standard_enum" AS ENUM('pantone', 'cmyk', 'custom', 'none')
        `);

        // Add new columns to orders table for Design & File Management
        await queryRunner.query(`
            ALTER TABLE "orders"
            ADD COLUMN "design_file_status" "design_file_status_enum",
            ADD COLUMN "design_file_formats" text,
            ADD COLUMN "design_approval_date" date,
            ADD COLUMN "design_revisions_count" integer DEFAULT 0,
            ADD COLUMN "design_notes" text
        `);

        // Add new columns for Plate & Separation Details
        await queryRunner.query(`
            ALTER TABLE "orders"
            ADD COLUMN "color_separation_type" "color_separation_type_enum",
            ADD COLUMN "number_of_plates" integer,
            ADD COLUMN "plate_size" character varying,
            ADD COLUMN "plate_material" "plate_material_enum",
            ADD COLUMN "plate_condition" "plate_condition_enum",
            ADD COLUMN "plate_approval_status" "plate_approval_status_enum",
            ADD COLUMN "plate_approval_date" date
        `);

        // Add new columns for Proofing & Quality Control
        await queryRunner.query(`
            ALTER TABLE "orders"
            ADD COLUMN "proof_type_required" text,
            ADD COLUMN "proof_status" "proof_status_enum",
            ADD COLUMN "proof_approval_date" date,
            ADD COLUMN "color_matching_standard" "color_matching_standard_enum",
            ADD COLUMN "quality_check_notes" text,
            ADD COLUMN "approved_by" character varying
        `);

        // Add new columns for Production Setup & Machine Requirements
        await queryRunner.query(`
            ALTER TABLE "orders"
            ADD COLUMN "preferred_machines" text,
            ADD COLUMN "special_setup_required" boolean DEFAULT false,
            ADD COLUMN "setup_instructions" text,
            ADD COLUMN "estimated_setup_time" integer,
            ADD COLUMN "machine_calibration_notes" text
        `);

        // Create indexes for filtering and searching
        await queryRunner.query(`CREATE INDEX "IDX_orders_design_file_status" ON "orders" ("design_file_status")`);
        await queryRunner.query(`CREATE INDEX "IDX_orders_plate_approval_status" ON "orders" ("plate_approval_status")`);
        await queryRunner.query(`CREATE INDEX "IDX_orders_proof_status" ON "orders" ("proof_status")`);
        await queryRunner.query(`CREATE INDEX "IDX_orders_color_separation_type" ON "orders" ("color_separation_type")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_design_file_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_plate_approval_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_proof_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_color_separation_type"`);

        // Drop columns
        await queryRunner.query(`
            ALTER TABLE "orders"
            DROP COLUMN "design_file_status",
            DROP COLUMN "design_file_formats",
            DROP COLUMN "design_approval_date",
            DROP COLUMN "design_revisions_count",
            DROP COLUMN "design_notes",
            DROP COLUMN "color_separation_type",
            DROP COLUMN "number_of_plates",
            DROP COLUMN "plate_size",
            DROP COLUMN "plate_material",
            DROP COLUMN "plate_condition",
            DROP COLUMN "plate_approval_status",
            DROP COLUMN "plate_approval_date",
            DROP COLUMN "proof_type_required",
            DROP COLUMN "proof_status",
            DROP COLUMN "proof_approval_date",
            DROP COLUMN "color_matching_standard",
            DROP COLUMN "quality_check_notes",
            DROP COLUMN "approved_by",
            DROP COLUMN "preferred_machines",
            DROP COLUMN "special_setup_required",
            DROP COLUMN "setup_instructions",
            DROP COLUMN "estimated_setup_time",
            DROP COLUMN "machine_calibration_notes"
        `);

        // Drop enums
        await queryRunner.query(`DROP TYPE IF EXISTS "design_file_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "color_separation_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "plate_material_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "plate_condition_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "plate_approval_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "proof_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "color_matching_standard_enum"`);
    }
}
