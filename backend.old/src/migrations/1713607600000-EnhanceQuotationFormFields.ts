import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class EnhanceQuotationFormFields1713607600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'double_sheet',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'bar_code',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'dye_req',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'batch_no',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'mfg_date',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'exp_date',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'mrp_rs',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'four_color_process',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'inside_printing',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'cmyk_cyan',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'cmyk_magenta',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'cmyk_yellow',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'cmyk_black',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'pantone_cmyk_1',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'pantone_cmyk_2',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'pantone_cmyk_3',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'pantone_cmyk_4',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'bleach_card',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'box_board_card',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'art_card',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'ups',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'price_per_kg_card',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'price_per_kg_paper',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'conversion_percent_card',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'conversion_percent_paper',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'fixed_charge_ctp',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'fixed_charge_spot_uv',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'fixed_charge_plain_uv',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'fixed_charge_drip_off_uv',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'fixed_charge_metalize',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'fixed_charge_emboss',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'fixed_charge_lamination',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
      }),
    );

    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'fixed_charge_others',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('quotations', 'double_sheet');
    await queryRunner.dropColumn('quotations', 'bar_code');
    await queryRunner.dropColumn('quotations', 'dye_req');
    await queryRunner.dropColumn('quotations', 'batch_no');
    await queryRunner.dropColumn('quotations', 'mfg_date');
    await queryRunner.dropColumn('quotations', 'exp_date');
    await queryRunner.dropColumn('quotations', 'mrp_rs');
    await queryRunner.dropColumn('quotations', 'four_color_process');
    await queryRunner.dropColumn('quotations', 'inside_printing');
    await queryRunner.dropColumn('quotations', 'cmyk_cyan');
    await queryRunner.dropColumn('quotations', 'cmyk_magenta');
    await queryRunner.dropColumn('quotations', 'cmyk_yellow');
    await queryRunner.dropColumn('quotations', 'cmyk_black');
    await queryRunner.dropColumn('quotations', 'pantone_cmyk_1');
    await queryRunner.dropColumn('quotations', 'pantone_cmyk_2');
    await queryRunner.dropColumn('quotations', 'pantone_cmyk_3');
    await queryRunner.dropColumn('quotations', 'pantone_cmyk_4');
    await queryRunner.dropColumn('quotations', 'bleach_card');
    await queryRunner.dropColumn('quotations', 'box_board_card');
    await queryRunner.dropColumn('quotations', 'art_card');
    await queryRunner.dropColumn('quotations', 'ups');
    await queryRunner.dropColumn('quotations', 'price_per_kg_card');
    await queryRunner.dropColumn('quotations', 'price_per_kg_paper');
    await queryRunner.dropColumn('quotations', 'conversion_percent_card');
    await queryRunner.dropColumn('quotations', 'conversion_percent_paper');
    await queryRunner.dropColumn('quotations', 'fixed_charge_ctp');
    await queryRunner.dropColumn('quotations', 'fixed_charge_spot_uv');
    await queryRunner.dropColumn('quotations', 'fixed_charge_plain_uv');
    await queryRunner.dropColumn('quotations', 'fixed_charge_drip_off_uv');
    await queryRunner.dropColumn('quotations', 'fixed_charge_metalize');
    await queryRunner.dropColumn('quotations', 'fixed_charge_emboss');
    await queryRunner.dropColumn('quotations', 'fixed_charge_lamination');
    await queryRunner.dropColumn('quotations', 'fixed_charge_others');
  }
}
