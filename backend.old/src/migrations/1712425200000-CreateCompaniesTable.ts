import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCompaniesTable1712425200000 implements MigrationInterface {
    name = 'CreateCompaniesTable1712425200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "companies" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL UNIQUE,
                "email" character varying,
                "phone" character varying,
                "address" text,
                "city" character varying,
                "state" character varying,
                "postal_code" character varying,
                "gstin" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_companies" PRIMARY KEY ("id")
            )
        `);

        // Insert 4 companies
        await queryRunner.query(`
            INSERT INTO "companies" ("name", "email", "phone", "address", "city", "state", "postal_code", "gstin")
            VALUES
                ('Capital Packages', 'info@capitalpackages.com', '+91-9876543210', '123 Business Park', 'Mumbai', 'Maharashtra', '400001', 'GST001'),
                ('CPP Pre Press', 'info@cppprepress.com', '+91-9876543211', '456 Industrial Area', 'Bangalore', 'Karnataka', '560001', 'GST002'),
                ('BEST FOIL', 'info@bestfoil.com', '+91-9876543212', '789 Manufacturing Zone', 'Delhi', 'Delhi', '110001', 'GST003'),
                ('SILVO Enterprises', 'info@silvo.com', '+91-9876543213', '321 Trade Center', 'Pune', 'Maharashtra', '411001', 'GST004')
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_company_name" ON "companies" ("name")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_company_name"`);
        await queryRunner.query(`DROP TABLE "companies"`);
    }
}
