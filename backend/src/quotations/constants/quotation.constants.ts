export enum ProductTypeEnum {
  UNIT_CARTON = 'unit_carton',
  LABEL = 'label',
  LEAFLET = 'leaflet',
  LITERATURE = 'literature',
  BOOKLET = 'booklet',
  STATIONARY = 'stationary',
  STICKER = 'sticker',
  OTHERS = 'others',
}

export enum PaperTypeEnum {
  // Unit Carton
  BLEACH_CARD = 'bleach_card',
  BOX_BOARD = 'box_board',
  ART_CARD = 'art_card',
  // Label
  ART_PAPER = 'art_paper',
  MATT_PAPER = 'matt_paper',
  // Leaflet
  NEWS_PAPER = 'news_paper',
  PRINTING_PAPER = 'printing_paper',
  VRG_PAPER = 'vrg_paper',
  OFFSET_PAPER = 'offset_paper',
  // Literature
  // (Art Paper, Matt Paper, Art Card - already defined)
  // Booklet
  // (Art Paper, Matt Paper - already defined)
  // Stationary
  CARBONLESS = 'carbonless',
  COLOR_BOND = 'color_bond',
  WRITING_PAPER = 'writing_paper',
  // Offset Paper - already defined
  // Sticker
  CHINA = 'china',
  BRANDED = 'branded',
  PVC = 'pvc',
  SILVER = 'silver',
}

export enum UnitEnum {
  KG = 'kg',
  NUMBER = 'number',
}

export enum DoubleSheetEnum {
  BLEACH = 'bleach',
  BOX_BOARD = 'box_board',
}

export enum DyeReqEnum {
  OLD = 'old',
  NEW = 'new',
}

export enum BarCodeEnum {
  YES = 'yes',
  NO = 'no',
}

export const GSM_OPTIONS = [190, 200, 206, 210, 215, 230, 240, 250, 270, 290, 300, 320, 350];

export const PAPER_TYPES_BY_PRODUCT: Record<ProductTypeEnum, PaperTypeEnum[]> = {
  [ProductTypeEnum.UNIT_CARTON]: [
    PaperTypeEnum.BLEACH_CARD,
    PaperTypeEnum.BOX_BOARD,
    PaperTypeEnum.ART_CARD,
  ],
  [ProductTypeEnum.LABEL]: [PaperTypeEnum.ART_PAPER, PaperTypeEnum.MATT_PAPER],
  [ProductTypeEnum.LEAFLET]: [
    PaperTypeEnum.NEWS_PAPER,
    PaperTypeEnum.PRINTING_PAPER,
    PaperTypeEnum.VRG_PAPER,
    PaperTypeEnum.OFFSET_PAPER,
  ],
  [ProductTypeEnum.LITERATURE]: [
    PaperTypeEnum.ART_PAPER,
    PaperTypeEnum.MATT_PAPER,
    PaperTypeEnum.ART_CARD,
  ],
  [ProductTypeEnum.BOOKLET]: [PaperTypeEnum.ART_PAPER, PaperTypeEnum.MATT_PAPER],
  [ProductTypeEnum.STATIONARY]: [
    PaperTypeEnum.CARBONLESS,
    PaperTypeEnum.COLOR_BOND,
    PaperTypeEnum.WRITING_PAPER,
    PaperTypeEnum.OFFSET_PAPER,
  ],
  [ProductTypeEnum.STICKER]: [
    PaperTypeEnum.CHINA,
    PaperTypeEnum.BRANDED,
    PaperTypeEnum.PVC,
    PaperTypeEnum.SILVER,
  ],
  [ProductTypeEnum.OTHERS]: [],
};

// Card/Sticker products use card cost formula
export const CARD_PRODUCTS = [
  ProductTypeEnum.UNIT_CARTON,
  ProductTypeEnum.LABEL,
  ProductTypeEnum.STICKER,
];

// Paper products use paper cost formula
export const PAPER_PRODUCTS = [
  ProductTypeEnum.LEAFLET,
  ProductTypeEnum.LITERATURE,
  ProductTypeEnum.BOOKLET,
  ProductTypeEnum.STATIONARY,
];
