import { useBrands } from '../../hooks/useInventory';
import { InventoryFilters } from '../../types';

interface CommonFiltersProps {
  filters: InventoryFilters;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
}

export default function CommonFilters({ filters, onFilterChange, onClearFilters }: CommonFiltersProps) {
  const { data: brands = [] } = useBrands(filters.main_category);

  return (
    <div className="flex gap-4 mb-6">
      <input
        type="text"
        placeholder="Search by item code, name..."
        value={filters.search || ''}
        onChange={(e) => onFilterChange('search', e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      <select
        value={filters.brand || ''}
        onChange={(e) => onFilterChange('brand', e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Brands</option>
        {brands.map((brand) => (
          <option key={brand} value={brand}>{brand}</option>
        ))}
      </select>

      <button
        onClick={onClearFilters}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        Clear Filters
      </button>
    </div>
  );
}
