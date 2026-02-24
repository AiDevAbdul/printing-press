import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1708665600000 implements MigrationInterface {
    name = 'CreateUserTable1708665600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "user_role_enum" AS ENUM('admin', 'sales', 'planner', 'accounts', 'inventory')
        `);

        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password_hash" character varying NOT NULL,
                "full_name" character varying NOT NULL,
                "role" "user_role_enum" NOT NULL DEFAULT 'sales',
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_user_email" UNIQUE ("email"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

        // Create default admin user (password: admin123)
        await queryRunner.query(`
            INSERT INTO "users" ("email", "password_hash", "full_name", "role")
            VALUES ('admin@printingpress.com', '$2b$10$8D8EOsBKdj02CbBQwhvpMOo4/4QN6SOMsq9A.oXV9x4f5hWtIelwW', 'System Admin', 'admin')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
    }
}
