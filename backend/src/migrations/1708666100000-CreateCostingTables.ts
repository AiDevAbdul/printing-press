import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCostingTables1708666100000 implements MigrationInterface {
    name = 'CreateCostingTables1708666100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "cost_type_enum" AS ENUM('material', 'labor', 'machine', 'overhead')
        `);

        await queryRunner.query(`
            CREATE TABLE "job_costs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "job_id" uuid NOT NULL,
                "cost_type" "cost_type_enum" NOT NULL,
                "item_id" uuid,
                "description" character varying NOT NULL,
                "quantity" decimal(10,2) NOT NULL,
                "unit_cost" decimal(10,2) NOT NULL,
                "total_cost" decimal(10,2) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_job_costs" PRIMARY KEY ("id"),
                CONSTRAINT "FK_job_cost_job" FOREIGN KEY ("job_id") REFERENCES "production_jobs"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_job_cost_item" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_job_cost_job" ON "job_costs" ("job_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_job_cost_type" ON "job_costs" ("cost_type")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_job_cost_type"`);
        await queryRunner.query(`DROP INDEX "IDX_job_cost_job"`);
        await queryRunner.query(`DROP TABLE "job_costs"`);
        await queryRunner.query(`DROP TYPE "cost_type_enum"`);
    }
}
