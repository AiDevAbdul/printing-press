import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhanceInventoryFiltering1709280000000 implements MigrationInterface {
    name = 'EnhanceInventoryFiltering1709280000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for main_category
        await queryRunner.query(`
            CREATE TYPE "inventory_items_main_category_enum" AS ENUM('block', 'paper', 'other_material')
        `);

        // Add new columns
        await queryRunner.query(`
            ALTER TABLE "inventory_items"
            ADD COLUMN "main_category" "inventory_items_main_category_enum",
            ADD COLUMN "material_type" VARCHAR(100),
            ADD COLUMN "size" VARCHAR(50)
        `);

        // Migrate existing data to main_category
        await queryRunner.query(`
            UPDATE "inventory_items" SET "main_category" = 'block' WHERE "category" = 'plates'
        `);
        await queryRunner.query(`
            UPDATE "inventory_items" SET "main_category" = 'paper' WHERE "category" = 'paper'
        `);
        await queryRunner.query(`
            UPDATE "inventory_items" SET "main_category" = 'other_material'
            WHERE "category" IN ('ink', 'finishing_materials', 'packaging')
        `);

        // Convert GSM from string to integer
        // First, create a temporary column
        await queryRunner.query(`
            ALTER TABLE "inventory_items" ADD COLUMN "gsm_temp" INTEGER
        `);

        // Copy numeric values to temp column
        await queryRunner.query(`
            UPDATE "inventory_items"
            SET "gsm_temp" = CASE
                WHEN "gsm" ~ '^[0-9]+$' THEN "gsm"::integer
                ELSE NULL
            END
        `);

        // Drop old column and rename temp column
        await queryRunner.query(`
            ALTER TABLE "inventory_items" DROP COLUMN "gsm"
        `);
        await queryRunner.query(`
            ALTER TABLE "inventory_items" RENAME COLUMN "gsm_temp" TO "gsm"
        `);

        // Add indexes for performance
        await queryRunner.query(`
            CREATE INDEX "IDX_inventory_main_category" ON "inventory_items" ("main_category")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_inventory_brand" ON "inventory_items" ("brand")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_inventory_color" ON "inventory_items" ("color")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_inventory_size" ON "inventory_items" ("size")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_inventory_size"`);
        await queryRunner.query(`DROP INDEX "IDX_inventory_color"`);
        await queryRunner.query(`DROP INDEX "IDX_inventory_brand"`);
        await queryRunner.query(`DROP INDEX "IDX_inventory_main_category"`);

        // Revert GSM to string
        await queryRunner.query(`
            ALTER TABLE "inventory_items" ADD COLUMN "gsm_temp" VARCHAR
        `);
        await queryRunner.query(`
            UPDATE "inventory_items" SET "gsm_temp" = "gsm"::varchar WHERE "gsm" IS NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "inventory_items" DROP COLUMN "gsm"
        `);
        await queryRunner.query(`
            ALTER TABLE "inventory_items" RENAME COLUMN "gsm_temp" TO "gsm"
        `);

        // Drop new columns
        await queryRunner.query(`
            ALTER TABLE "inventory_items"
            DROP COLUMN "size",
            DROP COLUMN "material_type",
            DROP COLUMN "main_category"
        `);

        // Drop enum type
        await queryRunner.query(`
            DROP TYPE "inventory_items_main_category_enum"
        `);
    }
}
