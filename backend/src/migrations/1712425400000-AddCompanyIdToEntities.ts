import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyIdToEntities1712425400000 implements MigrationInterface {
    name = 'AddCompanyIdToEntities1712425400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get the first company (Capital Packages)
        const company = await queryRunner.query(`
            SELECT "id" FROM "companies" WHERE "name" = 'Capital Packages' LIMIT 1
        `);

        const companyId = company && company.length > 0 ? company[0].id : null;

        // Add company_id to customers
        await queryRunner.query(`
            ALTER TABLE "customers" ADD COLUMN "company_id" uuid
        `);
        await queryRunner.query(`UPDATE "customers" SET "company_id" = $1`, [companyId]);
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "company_id" SET NOT NULL`);
        await queryRunner.query(`
            ALTER TABLE "customers" ADD CONSTRAINT "FK_customers_company_id"
            FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_customers_company_id" ON "customers" ("company_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_customers_company_status" ON "customers" ("company_id", "is_active")
        `);

        // Add company_id to orders
        await queryRunner.query(`
            ALTER TABLE "orders" ADD COLUMN "company_id" uuid
        `);
        await queryRunner.query(`UPDATE "orders" SET "company_id" = $1`, [companyId]);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "company_id" SET NOT NULL`);
        await queryRunner.query(`
            ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_company_id"
            FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_orders_company_id" ON "orders" ("company_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_orders_company_status" ON "orders" ("company_id", "status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_orders_company_created" ON "orders" ("company_id", "created_at")
        `);

        // Add company_id to quotations
        await queryRunner.query(`
            ALTER TABLE "quotations" ADD COLUMN "company_id" uuid
        `);
        await queryRunner.query(`UPDATE "quotations" SET "company_id" = $1`, [companyId]);
        await queryRunner.query(`ALTER TABLE "quotations" ALTER COLUMN "company_id" SET NOT NULL`);
        await queryRunner.query(`
            ALTER TABLE "quotations" ADD CONSTRAINT "FK_quotations_company_id"
            FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_quotations_company_id" ON "quotations" ("company_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_quotations_company_status" ON "quotations" ("company_id", "status")
        `);

        // Add company_id to invoices
        await queryRunner.query(`
            ALTER TABLE "invoices" ADD COLUMN "company_id" uuid
        `);
        await queryRunner.query(`UPDATE "invoices" SET "company_id" = $1`, [companyId]);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "company_id" SET NOT NULL`);
        await queryRunner.query(`
            ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_company_id"
            FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_invoices_company_id" ON "invoices" ("company_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_invoices_company_status" ON "invoices" ("company_id", "status")
        `);

        // Add company_id to production_jobs
        await queryRunner.query(`
            ALTER TABLE "production_jobs" ADD COLUMN "company_id" uuid
        `);
        await queryRunner.query(`UPDATE "production_jobs" SET "company_id" = $1`, [companyId]);
        await queryRunner.query(`ALTER TABLE "production_jobs" ALTER COLUMN "company_id" SET NOT NULL`);
        await queryRunner.query(`
            ALTER TABLE "production_jobs" ADD CONSTRAINT "FK_production_jobs_company_id"
            FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_production_jobs_company_id" ON "production_jobs" ("company_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_production_jobs_company_status" ON "production_jobs" ("company_id", "status")
        `);

        // Add company_id to inventory_items
        await queryRunner.query(`
            ALTER TABLE "inventory_items" ADD COLUMN "company_id" uuid
        `);
        await queryRunner.query(`UPDATE "inventory_items" SET "company_id" = $1`, [companyId]);
        await queryRunner.query(`ALTER TABLE "inventory_items" ALTER COLUMN "company_id" SET NOT NULL`);
        await queryRunner.query(`
            ALTER TABLE "inventory_items" ADD CONSTRAINT "FK_inventory_items_company_id"
            FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_inventory_items_company_id" ON "inventory_items" ("company_id")
        `);

        // Add company_id to quality_checkpoints
        await queryRunner.query(`
            ALTER TABLE "quality_checkpoints" ADD COLUMN "company_id" uuid
        `);
        await queryRunner.query(`UPDATE "quality_checkpoints" SET "company_id" = $1`, [companyId]);
        await queryRunner.query(`ALTER TABLE "quality_checkpoints" ALTER COLUMN "company_id" SET NOT NULL`);
        await queryRunner.query(`
            ALTER TABLE "quality_checkpoints" ADD CONSTRAINT "FK_quality_checkpoints_company_id"
            FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_quality_checkpoints_company_id" ON "quality_checkpoints" ("company_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes and constraints for each table
        const tables = [
            'customers', 'orders', 'quotations', 'invoices',
            'production_jobs', 'inventory_items', 'quality_checkpoints'
        ];

        for (const table of tables) {
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_${table}_company_id"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_${table}_company_status"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_${table}_company_created"`);
            await queryRunner.query(`
                ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "FK_${table}_company_id"
            `);
            await queryRunner.query(`
                ALTER TABLE "${table}" DROP COLUMN IF EXISTS "company_id"
            `);
        }
    }
}
