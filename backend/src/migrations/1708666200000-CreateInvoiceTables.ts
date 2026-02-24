import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInvoiceTables1708666200000 implements MigrationInterface {
    name = 'CreateInvoiceTables1708666200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "invoice_status_enum" AS ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled')
        `);

        await queryRunner.query(`
            CREATE TABLE "invoices" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "invoice_number" character varying NOT NULL,
                "order_id" uuid NOT NULL,
                "customer_id" uuid NOT NULL,
                "invoice_date" date NOT NULL,
                "due_date" date NOT NULL,
                "subtotal" decimal(10,2) NOT NULL,
                "tax_rate" decimal(5,2) NOT NULL DEFAULT 0,
                "tax_amount" decimal(10,2) NOT NULL DEFAULT 0,
                "total_amount" decimal(10,2) NOT NULL,
                "paid_amount" decimal(10,2) NOT NULL DEFAULT 0,
                "balance_amount" decimal(10,2) NOT NULL DEFAULT 0,
                "status" "invoice_status_enum" NOT NULL DEFAULT 'draft',
                "payment_terms" text,
                "notes" text,
                "created_by" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_invoice_number" UNIQUE ("invoice_number"),
                CONSTRAINT "PK_invoices" PRIMARY KEY ("id"),
                CONSTRAINT "FK_invoice_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT,
                CONSTRAINT "FK_invoice_customer" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT,
                CONSTRAINT "FK_invoice_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_invoice_status" ON "invoices" ("status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_invoice_customer" ON "invoices" ("customer_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_invoice_date" ON "invoices" ("invoice_date")
        `);

        await queryRunner.query(`
            CREATE TABLE "invoice_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "invoice_id" uuid NOT NULL,
                "description" character varying NOT NULL,
                "quantity" decimal(10,2) NOT NULL,
                "unit_price" decimal(10,2) NOT NULL,
                "total_price" decimal(10,2) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_invoice_items" PRIMARY KEY ("id"),
                CONSTRAINT "FK_invoice_item_invoice" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_invoice_item_invoice" ON "invoice_items" ("invoice_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_invoice_item_invoice"`);
        await queryRunner.query(`DROP TABLE "invoice_items"`);
        await queryRunner.query(`DROP INDEX "IDX_invoice_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoice_customer"`);
        await queryRunner.query(`DROP INDEX "IDX_invoice_status"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP TYPE "invoice_status_enum"`);
    }
}
