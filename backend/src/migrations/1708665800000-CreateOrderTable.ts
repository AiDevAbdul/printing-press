import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderTable1708665800000 implements MigrationInterface {
    name = 'CreateOrderTable1708665800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "order_status_enum" AS ENUM('pending', 'approved', 'in_production', 'completed', 'delivered', 'cancelled')
        `);

        await queryRunner.query(`
            CREATE TYPE "order_priority_enum" AS ENUM('low', 'normal', 'high', 'urgent')
        `);

        await queryRunner.query(`
            CREATE TYPE "printing_type_enum" AS ENUM('offset', 'digital', 'flexo')
        `);

        await queryRunner.query(`
            CREATE TABLE "orders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "order_number" character varying NOT NULL,
                "customer_id" uuid NOT NULL,
                "order_date" date NOT NULL,
                "delivery_date" date NOT NULL,
                "status" "order_status_enum" NOT NULL DEFAULT 'pending',
                "priority" "order_priority_enum" NOT NULL DEFAULT 'normal',
                "product_name" character varying NOT NULL,
                "quantity" integer NOT NULL,
                "unit" character varying NOT NULL,
                "size_length" decimal(10,2),
                "size_width" decimal(10,2),
                "size_unit" character varying,
                "substrate" character varying,
                "gsm" character varying,
                "colors" character varying,
                "printing_type" "printing_type_enum",
                "finishing_requirements" text,
                "special_instructions" text,
                "quoted_price" decimal(10,2),
                "final_price" decimal(10,2),
                "created_by" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_order_number" UNIQUE ("order_number"),
                CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
                CONSTRAINT "FK_order_customer" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT,
                CONSTRAINT "FK_order_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_order_status" ON "orders" ("status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_order_customer" ON "orders" ("customer_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_order_date" ON "orders" ("order_date")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_order_date"`);
        await queryRunner.query(`DROP INDEX "IDX_order_customer"`);
        await queryRunner.query(`DROP INDEX "IDX_order_status"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "printing_type_enum"`);
        await queryRunner.query(`DROP TYPE "order_priority_enum"`);
        await queryRunner.query(`DROP TYPE "order_status_enum"`);
    }
}
