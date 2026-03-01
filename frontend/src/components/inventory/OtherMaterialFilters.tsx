import { useColors, useMaterialTypes } from '../../hooks/useInventory';
import { InventoryFilters } from '../../types';

interface OtherMaterialFiltersProps {
  filters: InventoryFilters;
  onFilterChange: (key: string, value: any) => void;
}

export default function OtherMaterialFilters({ filters, onFilterChange }: OtherMaterialFiltersProps) {
  const { data: colors = [] } = useColors('other_material');
  const { data: materialTypes = [] } = useMaterialTypes('other_material');

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
        <select
          value={filters.category || ''}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Subcategories</option>
          <option value="ink">Ink</option>
          <option value="finishing_materials">Kerosene Oil / Greasing Ship</option>
          <option value="packaging">Rubber Band / Packaging</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
        <select
          value={filters.color || ''}
          onChange={(e) => onFilterChange('color', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Colors</option>
          {colors.map((color) => (
            <option key={color} value={color}>{color}</option>
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
          {materialTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
