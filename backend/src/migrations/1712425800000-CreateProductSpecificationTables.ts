import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateProductSpecificationTables1712425800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create product_specifications table
    await queryRunner.createTable(
      new Table({
        name: 'product_specifications',
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
            isNullable: true,
          },
          {
            name: 'product_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'customer_group',
            type: 'enum',
            enum: ['export', 'local', 'govt'],
            isNullable: true,
          },
          {
            name: 'file_folder_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'form_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'card_type',
            type: 'enum',
            enum: ['plain', 'coated', 'uncoated', 'specialty'],
            isNullable: true,
          },
          {
            name: 'card_gramage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'back_printing',
            type: 'boolean',
            default: false,
          },
          {
            name: 'lamination_type',
            type: 'enum',
            enum: ['uv', 'matte', 'gloss', 'emboss', 'metalize', 'none'],
            default: "'none'",
          },
          {
            name: 'lamination_shine',
            type: 'boolean',
            default: false,
          },
          {
            name: 'lamination_metalize',
            type: 'boolean',
            default: false,
          },
          {
            name: 'lamination_emboss',
            type: 'boolean',
            default: false,
          },
          {
            name: 'lamination_details',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'varnish_type',
            type: 'enum',
            enum: ['water_base', 'duck', 'none'],
            default: "'none'",
          },
          {
            name: 'varnish_spot_uv',
            type: 'boolean',
            default: false,
          },
          {
            name: 'varnish_drip_off',
            type: 'boolean',
            default: false,
          },
          {
            name: 'varnish_matt',
            type: 'boolean',
            default: false,
          },
          {
            name: 'has_barcode',
            type: 'boolean',
            default: false,
          },
          {
            name: 'batch_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'has_price',
            type: 'boolean',
            default: false,
          },
          {
            name: 'color_cyan',
            type: 'boolean',
            default: false,
          },
          {
            name: 'color_magenta',
            type: 'boolean',
            default: false,
          },
          {
            name: 'color_yellow',
            type: 'boolean',
            default: false,
          },
          {
            name: 'color_black',
            type: 'boolean',
            default: false,
          },
          {
            name: 'has_special_colors',
            type: 'boolean',
            default: false,
          },
          {
            name: 'special_colors_detail',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'pantone_p1',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'pantone_p2',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'pantone_p3',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'pantone_p4',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'required_card_length',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'required_card_width',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'required_card_gramage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'printing_card_length',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'printing_card_width',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'printing_card_gramage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'ups_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'grain_side_first',
            type: 'boolean',
            default: false,
          },
          {
            name: 'old_dye_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'new_dye_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_new_dye',
            type: 'boolean',
            default: false,
          },
          {
            name: 'ctp_required',
            type: 'boolean',
            default: false,
          },
          {
            name: 'drip_off_required',
            type: 'boolean',
            default: false,
          },
          {
            name: 'spot_uv_required',
            type: 'boolean',
            default: false,
          },
          {
            name: 'emboss_required',
            type: 'boolean',
            default: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'pending_approval', 'approved', 'rejected'],
            default: "'draft'",
          },
          {
            name: 'prepared_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'received_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'grn_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'other_information',
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
        indices: [
          {
            name: 'idx_product_specifications_company_id',
            columnNames: ['company_id'],
          },
          {
            name: 'idx_product_specifications_design_id',
            columnNames: ['design_id'],
          },
          {
            name: 'idx_product_specifications_status',
            columnNames: ['status'],
          },
        ],
      }),
    );

    // Add foreign keys for product_specifications
    await queryRunner.createForeignKey(
      'product_specifications',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'product_specifications',
      new TableForeignKey({
        columnNames: ['design_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'designs',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'product_specifications',
      new TableForeignKey({
        columnNames: ['prepared_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'product_specifications',
      new TableForeignKey({
        columnNames: ['received_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    // Create specification_approvals table
    await queryRunner.createTable(
      new Table({
        name: 'specification_approvals',
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
            name: 'specification_id',
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
            enum: ['pending', 'approved', 'rejected', 'revision_requested'],
            default: "'pending'",
          },
          {
            name: 'comments',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'approved_at',
            type: 'timestamp',
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
        indices: [
          {
            name: 'idx_specification_approvals_company_id',
            columnNames: ['company_id'],
          },
          {
            name: 'idx_specification_approvals_specification_id',
            columnNames: ['specification_id'],
          },
          {
            name: 'idx_specification_approvals_status',
            columnNames: ['status'],
          },
        ],
      }),
    );

    // Add foreign keys for specification_approvals
    await queryRunner.createForeignKey(
      'specification_approvals',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'specification_approvals',
      new TableForeignKey({
        columnNames: ['specification_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product_specifications',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'specification_approvals',
      new TableForeignKey({
        columnNames: ['approver_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop specification_approvals table
    await queryRunner.dropTable('specification_approvals');

    // Drop product_specifications table
    await queryRunner.dropTable('product_specifications');
  }
}
