import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomerTable1708665700000 implements MigrationInterface {
    name = 'CreateCustomerTable1708665700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "customers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "company_name" character varying,
                "email" character varying NOT NULL,
                "phone" character varying NOT NULL,
                "address" text,
                "city" character varying,
                "state" character varying,
                "postal_code" character varying,
                "gstin" character varying,
                "credit_limit" decimal(10,2) NOT NULL DEFAULT 0,
                "credit_days" integer NOT NULL DEFAULT 30,
                "payment_terms" text,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_by" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_customers" PRIMARY KEY ("id"),
                CONSTRAINT "FK_customer_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_customer_name" ON "customers" ("name")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_customer_email" ON "customers" ("email")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_customer_email"`);
        await queryRunner.query(`DROP INDEX "IDX_customer_name"`);
        await queryRunner.query(`DROP TABLE "customers"`);
    }
}
