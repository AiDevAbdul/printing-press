import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSuperAdminToUsers1712426000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'is_super_admin',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );

    // Create index for efficient queries
    await queryRunner.query(
      `CREATE INDEX idx_users_is_super_admin ON users(is_super_admin)`,
    );

    // Update the default admin user to be a super-admin
    await queryRunner.query(
      `UPDATE users SET is_super_admin = true WHERE email = 'admin@printingpress.com'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_users_is_super_admin`);
    await queryRunner.dropColumn('users', 'is_super_admin');
  }
}
