import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyIdToUsers1712425300000 implements MigrationInterface {
    name = 'AddCompanyIdToUsers1712425300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add company_id column as nullable first
        await queryRunner.query(`
            ALTER TABLE "users" ADD COLUMN "company_id" uuid
        `);

        // Get the first company (Capital Packages)
        const company = await queryRunner.query(`
            SELECT "id" FROM "companies" WHERE "name" = 'Capital Packages' LIMIT 1
        `);

        if (company && company.length > 0) {
            const companyId = company[0].id;

            // Update all existing users to belong to Capital Packages
            await queryRunner.query(`
                UPDATE "users" SET "company_id" = $1
            `, [companyId]);

            // Now make the column NOT NULL
            await queryRunner.query(`
                ALTER TABLE "users" ALTER COLUMN "company_id" SET NOT NULL
            `);

            // Add foreign key constraint
            await queryRunner.query(`
                ALTER TABLE "users" ADD CONSTRAINT "FK_users_company_id"
                FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT
            `);
        }

        // Remove unique constraint on email and add composite unique constraint
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "UQ_user_email"
        `);

        await queryRunner.query(`
            ALTER TABLE "users" ADD CONSTRAINT "UQ_user_email_company"
            UNIQUE ("email", "company_id")
        `);

        // Create index for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_users_company_id" ON "users" ("company_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_users_company_id"`);

        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "UQ_user_email_company"
        `);

        await queryRunner.query(`
            ALTER TABLE "users" ADD CONSTRAINT "UQ_user_email" UNIQUE ("email")
        `);

        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_users_company_id"
        `);

        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "company_id"
        `);
    }
}
