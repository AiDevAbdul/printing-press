import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInventoryTables1708666000000 implements MigrationInterface {
    name = 'CreateInventoryTables1708666000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "inventory_category_enum" AS ENUM('paper', 'ink', 'plates', 'finishing_materials', 'packaging')
        `);

        await queryRunner.query(`
            CREATE TABLE "inventory_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "item_code" character varying NOT NULL,
                "item_name" character varying NOT NULL,
                "category" "inventory_category_enum" NOT NULL,
                "subcategory" character varying,
                "unit" character varying NOT NULL,
                "gsm" character varying,
                "size_length" decimal(10,2),
                "size_width" decimal(10,2),
                "brand" character varying,
                "color" character varying,
                "current_stock" decimal(10,2) NOT NULL DEFAULT 0,
                "reorder_level" decimal(10,2) NOT NULL DEFAULT 0,
                "reorder_quantity" decimal(10,2) NOT NULL DEFAULT 0,
                "unit_cost" decimal(10,2) NOT NULL DEFAULT 0,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_item_code" UNIQUE ("item_code"),
                CONSTRAINT "PK_inventory_items" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_inventory_item_category" ON "inventory_items" ("category")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_inventory_item_name" ON "inventory_items" ("item_name")
        `);

        await queryRunner.query(`
            CREATE TYPE "transaction_type_enum" AS ENUM('stock_in', 'stock_out', 'adjustment')
        `);

        await queryRunner.query(`
            CREATE TYPE "reference_type_enum" AS ENUM('purchase', 'production_job', 'adjustment')
        `);

        await queryRunner.query(`
            CREATE TABLE "stock_transactions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "transaction_type" "transaction_type_enum" NOT NULL,
                "item_id" uuid NOT NULL,
                "quantity" decimal(10,2) NOT NULL,
                "unit_cost" decimal(10,2) NOT NULL DEFAULT 0,
                "reference_type" "reference_type_enum" NOT NULL,
                "reference_id" uuid,
                "notes" text,
                "transaction_date" date NOT NULL,
                "created_by" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_stock_transactions" PRIMARY KEY ("id"),
                CONSTRAINT "FK_stock_transaction_item" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT,
                CONSTRAINT "FK_stock_transaction_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_stock_transaction_item" ON "stock_transactions" ("item_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_stock_transaction_date" ON "stock_transactions" ("transaction_date")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_stock_transaction_date"`);
        await queryRunner.query(`DROP INDEX "IDX_stock_transaction_item"`);
        await queryRunner.query(`DROP TABLE "stock_transactions"`);
        await queryRunner.query(`DROP TYPE "reference_type_enum"`);
        await queryRunner.query(`DROP TYPE "transaction_type_enum"`);
        await queryRunner.query(`DROP INDEX "IDX_inventory_item_name"`);
        await queryRunner.query(`DROP INDEX "IDX_inventory_item_category"`);
        await queryRunner.query(`DROP TABLE "inventory_items"`);
        await queryRunner.query(`DROP TYPE "inventory_category_enum"`);
    }
}
