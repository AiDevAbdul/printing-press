import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhanceInvoiceFields1709285000000 implements MigrationInterface {
    name = 'EnhanceInvoiceFields1709285000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns to invoices table
        await queryRunner.query(`
            ALTER TABLE "invoices"
            ADD COLUMN "company_name" VARCHAR(255),
            ADD COLUMN "group_name" VARCHAR(255),
            ADD COLUMN "product_type" VARCHAR(100),
            ADD COLUMN "final_quantity" DECIMAL(10,2),
            ADD COLUMN "unit_rate" DECIMAL(10,2),
            ADD COLUMN "strength" VARCHAR(100),
            ADD COLUMN "sales_tax_applicable" BOOLEAN DEFAULT false
        `);

        // Add index on product_type for faster filtering
        await queryRunner.query(`
            CREATE INDEX "IDX_invoice_product_type" ON "invoices" ("product_type")
        `);

        // Add index on sales_tax_applicable for tax reports
        await queryRunner.query(`
            CREATE INDEX "IDX_invoice_sales_tax" ON "invoices" ("sales_tax_applicable")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_invoice_sales_tax"`);
        await queryRunner.query(`DROP INDEX "IDX_invoice_product_type"`);

        // Drop columns
        await queryRunner.query(`
            ALTER TABLE "invoices"
            DROP COLUMN "sales_tax_applicable",
            DROP COLUMN "strength",
            DROP COLUMN "unit_rate",
            DROP COLUMN "final_quantity",
            DROP COLUMN "product_type",
            DROP COLUMN "group_name",
            DROP COLUMN "company_name"
        `);
    }
}
