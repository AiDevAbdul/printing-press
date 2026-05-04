import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePrepressTablesAndRelations1712425700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create designs table
    await queryRunner.createTable(
      new Table({
        name: 'designs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'design_type',
            type: 'enum',
            enum: ['box', 'label', 'literature', 'logo', 'other'],
            isNullable: false,
          },
          {
            name: 'product_category',
            type: 'enum',
            enum: ['commercial', 'logo', 'product', 'other'],
            isNullable: false,
          },
          {
            name: 'product_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['in_design', 'waiting_for_data', 'approved', 'rejected'],
            default: "'in_design'",
            isNullable: false,
          },
          {
            name: 'designer_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'specs_sheet_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'approval_sheet_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create design_approvals table
    await queryRunner.createTable(
      new Table({
        name: 'design_approvals',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'design_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'approver_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'approved', 'rejected'],
            default: "'pending'",
            isNullable: false,
          },
          {
            name: 'comments',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create design_attachments table
    await queryRunner.createTable(
      new Table({
        name: 'design_attachments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'design_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'file_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'file_url',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'file_type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'uploaded_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign keys for designs table
    await queryRunner.createForeignKey(
      'designs',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'designs',
      new TableForeignKey({
        columnNames: ['designer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    // Add foreign keys for design_approvals table
    await queryRunner.createForeignKey(
      'design_approvals',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'design_approvals',
      new TableForeignKey({
        columnNames: ['design_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'designs',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'design_approvals',
      new TableForeignKey({
        columnNames: ['approver_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign keys for design_attachments table
    await queryRunner.createForeignKey(
      'design_attachments',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'design_attachments',
      new TableForeignKey({
        columnNames: ['design_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'designs',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'design_attachments',
      new TableForeignKey({
        columnNames: ['uploaded_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'designs',
      new TableIndex({
        columnNames: ['company_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'designs',
      new TableIndex({
        columnNames: ['company_id', 'product_category'],
      }),
    );

    await queryRunner.createIndex(
      'designs',
      new TableIndex({
        columnNames: ['company_id', 'design_type'],
      }),
    );

    await queryRunner.createIndex(
      'design_approvals',
      new TableIndex({
        columnNames: ['company_id', 'design_id'],
      }),
    );

    await queryRunner.createIndex(
      'design_attachments',
      new TableIndex({
        columnNames: ['company_id', 'design_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('design_attachments', true);
    await queryRunner.dropTable('design_approvals', true);
    await queryRunner.dropTable('designs', true);
  }
}
