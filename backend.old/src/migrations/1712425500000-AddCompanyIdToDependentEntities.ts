import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyIdToDependentEntities1712425500000 implements MigrationInterface {
    name = 'AddCompanyIdToDependentEntities1712425500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get the first company (Capital Packages)
        const company = await queryRunner.query(`
            SELECT "id" FROM "companies" WHERE "name" = 'Capital Packages' LIMIT 1
        `);

        const companyId = company && company.length > 0 ? company[0].id : null;

        // Add company_id to production_stage_history
        if (await queryRunner.hasTable('production_stage_history')) {
            await queryRunner.query(`
                ALTER TABLE "production_stage_history" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "production_stage_history" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "production_stage_history" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "production_stage_history" ADD CONSTRAINT "FK_production_stage_history_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_production_stage_history_company_id" ON "production_stage_history" ("company_id")
            `);
        }

        // Add company_id to stock_transactions
        if (await queryRunner.hasTable('stock_transactions')) {
            await queryRunner.query(`
                ALTER TABLE "stock_transactions" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "stock_transactions" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "stock_transactions" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "stock_transactions" ADD CONSTRAINT "FK_stock_transactions_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_stock_transactions_company_id" ON "stock_transactions" ("company_id")
            `);
        }

        // Add company_id to job_costs
        if (await queryRunner.hasTable('job_costs')) {
            await queryRunner.query(`
                ALTER TABLE "job_costs" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "job_costs" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "job_costs" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "job_costs" ADD CONSTRAINT "FK_job_costs_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_job_costs_company_id" ON "job_costs" ("company_id")
            `);
        }

        // Add company_id to quotation_items
        if (await queryRunner.hasTable('quotation_items')) {
            await queryRunner.query(`
                ALTER TABLE "quotation_items" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "quotation_items" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "quotation_items" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "quotation_items" ADD CONSTRAINT "FK_quotation_items_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_quotation_items_company_id" ON "quotation_items" ("company_id")
            `);
        }

        // Add company_id to quotation_history
        if (await queryRunner.hasTable('quotation_history')) {
            await queryRunner.query(`
                ALTER TABLE "quotation_history" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "quotation_history" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "quotation_history" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "quotation_history" ADD CONSTRAINT "FK_quotation_history_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_quotation_history_company_id" ON "quotation_history" ("company_id")
            `);
        }

        // Add company_id to invoice_items
        if (await queryRunner.hasTable('invoice_items')) {
            await queryRunner.query(`
                ALTER TABLE "invoice_items" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "invoice_items" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "invoice_items" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_invoice_items_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_invoice_items_company_id" ON "invoice_items" ("company_id")
            `);
        }

        // Add company_id to quality_inspections
        if (await queryRunner.hasTable('quality_inspections')) {
            await queryRunner.query(`
                ALTER TABLE "quality_inspections" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "quality_inspections" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "quality_inspections" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "quality_inspections" ADD CONSTRAINT "FK_quality_inspections_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_quality_inspections_company_id" ON "quality_inspections" ("company_id")
            `);
        }

        // Add company_id to quality_defects
        if (await queryRunner.hasTable('quality_defects')) {
            await queryRunner.query(`
                ALTER TABLE "quality_defects" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "quality_defects" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "quality_defects" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "quality_defects" ADD CONSTRAINT "FK_quality_defects_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_quality_defects_company_id" ON "quality_defects" ("company_id")
            `);
        }

        // Add company_id to quality_rejections
        if (await queryRunner.hasTable('quality_rejections')) {
            await queryRunner.query(`
                ALTER TABLE "quality_rejections" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "quality_rejections" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "quality_rejections" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "quality_rejections" ADD CONSTRAINT "FK_quality_rejections_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_quality_rejections_company_id" ON "quality_rejections" ("company_id")
            `);
        }

        // Add company_id to customer_complaints
        if (await queryRunner.hasTable('customer_complaints')) {
            await queryRunner.query(`
                ALTER TABLE "customer_complaints" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "customer_complaints" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "customer_complaints" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "customer_complaints" ADD CONSTRAINT "FK_customer_complaints_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_customer_complaints_company_id" ON "customer_complaints" ("company_id")
            `);
        }

        // Add company_id to deliveries
        if (await queryRunner.hasTable('deliveries')) {
            await queryRunner.query(`
                ALTER TABLE "deliveries" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "deliveries" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "deliveries" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "deliveries" ADD CONSTRAINT "FK_deliveries_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_deliveries_company_id" ON "deliveries" ("company_id")
            `);
        }

        // Add company_id to packing_lists
        if (await queryRunner.hasTable('packing_lists')) {
            await queryRunner.query(`
                ALTER TABLE "packing_lists" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "packing_lists" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "packing_lists" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "packing_lists" ADD CONSTRAINT "FK_packing_lists_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_packing_lists_company_id" ON "packing_lists" ("company_id")
            `);
        }

        // Add company_id to challans
        if (await queryRunner.hasTable('challans')) {
            await queryRunner.query(`
                ALTER TABLE "challans" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "challans" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "challans" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "challans" ADD CONSTRAINT "FK_challans_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_challans_company_id" ON "challans" ("company_id")
            `);
        }

        // Add company_id to delivery_tracking
        if (await queryRunner.hasTable('delivery_tracking')) {
            await queryRunner.query(`
                ALTER TABLE "delivery_tracking" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "delivery_tracking" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "delivery_tracking" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "delivery_tracking" ADD CONSTRAINT "FK_delivery_tracking_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_delivery_tracking_company_id" ON "delivery_tracking" ("company_id")
            `);
        }

        // Add company_id to material_consumption
        if (await queryRunner.hasTable('material_consumption')) {
            await queryRunner.query(`
                ALTER TABLE "material_consumption" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "material_consumption" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "material_consumption" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "material_consumption" ADD CONSTRAINT "FK_material_consumption_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_material_consumption_company_id" ON "material_consumption" ("company_id")
            `);
        }

        // Add company_id to machine_counters
        if (await queryRunner.hasTable('machine_counters')) {
            await queryRunner.query(`
                ALTER TABLE "machine_counters" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "machine_counters" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "machine_counters" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "machine_counters" ADD CONSTRAINT "FK_machine_counters_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_machine_counters_company_id" ON "machine_counters" ("company_id")
            `);
        }

        // Add company_id to wastage_records
        if (await queryRunner.hasTable('wastage_records')) {
            await queryRunner.query(`
                ALTER TABLE "wastage_records" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "wastage_records" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "wastage_records" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "wastage_records" ADD CONSTRAINT "FK_wastage_records_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_wastage_records_company_id" ON "wastage_records" ("company_id")
            `);
        }

        // Add company_id to notifications
        if (await queryRunner.hasTable('notifications')) {
            await queryRunner.query(`
                ALTER TABLE "notifications" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "notifications" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "notifications" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_notifications_company_id" ON "notifications" ("company_id")
            `);
        }

        // Add company_id to user_activity_log
        if (await queryRunner.hasTable('user_activity_log')) {
            await queryRunner.query(`
                ALTER TABLE "user_activity_log" ADD COLUMN "company_id" uuid
            `);

            await queryRunner.query(`
                UPDATE "user_activity_log" SET "company_id" = $1
            `, [companyId]);

            await queryRunner.query(`
                ALTER TABLE "user_activity_log" ALTER COLUMN "company_id" SET NOT NULL
            `);

            await queryRunner.query(`
                ALTER TABLE "user_activity_log" ADD CONSTRAINT "FK_user_activity_log_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);

            await queryRunner.query(`
                CREATE INDEX "IDX_user_activity_log_company_id" ON "user_activity_log" ("company_id")
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tables = [
            'production_stage_history', 'stock_transactions', 'job_costs',
            'quotation_items', 'quotation_history', 'invoice_items',
            'quality_inspections', 'quality_defects', 'quality_rejections',
            'customer_complaints', 'deliveries', 'packing_lists', 'challans',
            'delivery_tracking', 'material_consumption', 'machine_counters',
            'wastage_records', 'notifications', 'user_activity_log'
        ];

        for (const table of tables) {
            if (await queryRunner.hasTable(table)) {
                await queryRunner.query(`DROP INDEX IF EXISTS "IDX_${table}_company_id"`);
                await queryRunner.query(`
                    ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "FK_${table}_company_id"
                `);
                await queryRunner.query(`
                    ALTER TABLE "${table}" DROP COLUMN IF EXISTS "company_id"
                `);
            }
        }
    }
}
