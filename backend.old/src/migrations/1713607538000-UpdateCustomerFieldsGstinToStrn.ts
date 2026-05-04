import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateCustomerFieldsGstinToStrn1713607538000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns
    await queryRunner.addColumn(
      'customers',
      new TableColumn({
        name: 'customer_group',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'customers',
      new TableColumn({
        name: 'strn',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'customers',
      new TableColumn({
        name: 'ntn',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Drop old gstin column
    await queryRunner.dropColumn('customers', 'gstin');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore gstin column
    await queryRunner.addColumn(
      'customers',
      new TableColumn({
        name: 'gstin',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Drop new columns
    await queryRunner.dropColumn('customers', 'ntn');
    await queryRunner.dropColumn('customers', 'strn');
    await queryRunner.dropColumn('customers', 'customer_group');
  }
}
