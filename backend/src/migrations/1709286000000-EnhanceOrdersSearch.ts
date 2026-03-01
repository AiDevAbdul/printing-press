import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhanceOrdersSearch1709286000000 implements MigrationInterface {
    name = 'EnhanceOrdersSearch1709286000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns for enhanced order tracking
        await queryRunner.query(`
            ALTER TABLE "orders"
            ADD COLUMN "group_name" VARCHAR(255),
            ADD COLUMN "specifications" TEXT,
            ADD COLUMN "production_status" VARCHAR(255),
            ADD COLUMN "auto_sync_enabled" BOOLEAN DEFAULT true
        `);

        // Add indexes for search performance
        await queryRunner.query(`
            CREATE INDEX "IDX_orders_product_name" ON "orders" ("product_name")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_orders_group_name" ON "orders" ("group_name")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_orders_batch_number" ON "orders" ("batch_number")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_orders_status" ON "orders" ("status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_orders_product_type" ON "orders" ("product_type")
        `);

        // Add index on customer_id for customer search
        await queryRunner.query(`
            CREATE INDEX "IDX_orders_customer_id" ON "orders" ("customer_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_orders_customer_id"`);
        await queryRunner.query(`DROP INDEX "IDX_orders_product_type"`);
        await queryRunner.query(`DROP INDEX "IDX_orders_status"`);
        await queryRunner.query(`DROP INDEX "IDX_orders_batch_number"`);
        await queryRunner.query(`DROP INDEX "IDX_orders_group_name"`);
        await queryRunner.query(`DROP INDEX "IDX_orders_product_name"`);

        // Drop new columns
        await queryRunner.query(`
            ALTER TABLE "orders"
            DROP COLUMN "auto_sync_enabled",
            DROP COLUMN "production_status",
            DROP COLUMN "specifications",
            DROP COLUMN "group_name"
        `);
    }
}
