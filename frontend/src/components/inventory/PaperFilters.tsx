import { useSizes, useGSMValues, useMaterialTypes } from '../../hooks/useInventory';
import { InventoryFilters } from '../../types';

interface PaperFiltersProps {
  filters: InventoryFilters;
  onFilterChange: (key: string, value: any) => void;
}

export default function PaperFilters({ filters, onFilterChange }: PaperFiltersProps) {
  const { data: sizes = [] } = useSizes();
  const { data: gsmValues = [] } = useGSMValues();
  const { data: materialTypes = [] } = useMaterialTypes('paper');

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
        <select
          value={filters.size || ''}
          onChange={(e) => onFilterChange('size', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sizes</option>
          <option value="A4">A4</option>
          <option value="A3">A3</option>
          <option value="A5">A5</option>
          <option value="custom">Custom</option>
          {sizes.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">GSM</label>
        <select
          value={filters.gsm || ''}
          onChange={(e) => onFilterChange('gsm', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All GSM</option>
          {gsmValues.map((gsm) => (
            <option key={gsm} value={gsm}>{gsm} GSM</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label>
        <select
          value={filters.material_type || ''}
          onChange={(e) => onFilterChange('material_type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="Art Paper">Art Paper</option>
          <option value="Bond">Bond</option>
          <option value="Cardstock">Cardstock</option>
          <option value="Coated">Coated</option>
          <option value="Uncoated">Uncoated</option>
          {materialTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
