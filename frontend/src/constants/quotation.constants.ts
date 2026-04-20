export const PRODUCT_TYPES = [
  { label: 'Unit Carton', value: 'unit_carton' },
  { label: 'Label', value: 'label' },
  { label: 'Leaflet', value: 'leaflet' },
  { label: 'Literature', value: 'literature' },
  { label: 'Booklet', value: 'booklet' },
  { label: 'Stationary', value: 'stationary' },
  { label: 'Sticker', value: 'sticker' },
  { label: 'Others', value: 'others' },
];

export const PAPER_TYPES_BY_PRODUCT: Record<string, string[]> = {
  'unit_carton': ['Bleach card', 'Box board', 'Art Card'],
  'label': ['Art Paper', 'Matt Paper'],
  'leaflet': ['News Paper', 'Printing Paper', 'VRG Paper', 'Offset Paper'],
  'literature': ['Art Paper', 'Matt Paper', 'Art Card'],
  'booklet': ['Art Paper', 'Matt Paper'],
  'stationary': ['Carbonless', 'ColorBond', 'Writing Paper', 'Offset Paper'],
  'sticker': ['China', 'Branded', 'PVC', 'Silver'],
  'others': [],
};

export const GSM_OPTIONS = [190, 200, 206, 210, 215, 230, 240, 250, 270, 290, 300, 320, 350];

export const UNIT_OPTIONS = ['KG', 'Number'];

export const DOUBLE_SHEET_OPTIONS = ['Bleach', 'Box Board'];

export const DYE_REQ_OPTIONS = ['Old', 'New'];

export const BAR_CODE_OPTIONS = ['Yes', 'No'];

// Card/Sticker products use card cost formula
export const CARD_PRODUCTS = ['unit_carton', 'label', 'sticker'];

// Paper products use paper cost formula
export const PAPER_PRODUCTS = ['leaflet', 'literature', 'booklet', 'stationary'];

export function isCardProduct(productType: string): boolean {
  return CARD_PRODUCTS.includes(productType);
}

export function isPaperProduct(productType: string): boolean {
  return PAPER_PRODUCTS.includes(productType);
}
