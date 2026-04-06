import { MigrationInterface, QueryRunner } from "typeorm";

export class EnsureAdminUserHasCompany1712425600000 implements MigrationInterface {
    name = 'EnsureAdminUserHasCompany1712425600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get the first company (Capital Packages)
        const company = await queryRunner.query(`
            SELECT "id" FROM "companies" WHERE "name" = 'Capital Packages' LIMIT 1
        `);

        if (company && company.length > 0) {
            const companyId = company[0].id;

            // Update admin user to belong to Capital Packages
            await queryRunner.query(`
                UPDATE "users" SET "company_id" = $1 WHERE "email" = 'admin@printingpress.com'
            `, [companyId]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No rollback needed
    }
}
