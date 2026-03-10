import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderColorAndCardFields1773157557600 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new color fields
        await queryRunner.query(`ALTER TABLE "orders" ADD "color_cyan" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "color_magenta" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "color_yellow" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "color_black" character varying`);

        // Add card dimension fields
        await queryRunner.query(`ALTER TABLE "orders" ADD "card_width" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "card_length" character varying`);

        // Drop the old color_cmyk column if it exists
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "color_cmyk"`);

        // Change varnish_type from enum to text (for array storage)
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "varnish_type" TYPE text`);

        // Change lamination_type from enum to text (for array storage)
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "lamination_type" TYPE text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove new color fields
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "color_cyan"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "color_magenta"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "color_yellow"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "color_black"`);

        // Remove card dimension fields
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "card_width"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "card_length"`);

        // Add back color_cmyk column
        await queryRunner.query(`ALTER TABLE "orders" ADD "color_cmyk" character varying`);
    }

}
