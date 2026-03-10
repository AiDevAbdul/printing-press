import { useState } from 'react';
import { useInventoryItems, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem } from '../../hooks/useInventory';
import { InventoryItem, InventoryFilters, InventoryCategory } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import CategoryTabs from '../../components/inventory/CategoryTabs';
import PaperFilters from '../../components/inventory/PaperFilters';
import OtherMaterialFilters from '../../components/inventory/OtherMaterialFilters';
import CommonFilters from '../../components/inventory/CommonFilters';
import { Plus } from 'lucide-react';

interface InventoryFormData {
  item_code: string;
  item_name: string;
  main_category: 'block' | 'paper' | 'other_material';
  category: InventoryCategory;
  subcategory: string;
  unit: string;
  gsm?: number;
  size?: string;
  size_length?: number;
  size_width?: number;
  material_type?: string;
  brand?: string;
  color?: string;
  current_stock: number;
  reorder_level: number;
  reorder_quantity: number;
  unit_cost: number;
}

const categoryColors: Record<string, string> = {
  paper: 'bg-blue-100 text-blue-800',
  ink: 'bg-purple-100 text-purple-800',
  plates: 'bg-green-100 text-green-800',
  finishing_materials: 'bg-yellow-100 text-yellow-800',
  packaging: 'bg-orange-100 text-orange-800',
};

export default function Inventory() {
  const [filters, setFilters] = useState<InventoryFilters>({
    main_category: 'paper',
    page: 1,
    limit: 50,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<InventoryFormData>({
    item_code: '',
    item_name: '',
    main_category: 'paper',
    category: InventoryCategory.PAPER,
    subcategory: '',
    unit: 'kg',
    current_stock: 0,
    reorder_level: 0,
    reorder_quantity: 0,
    unit_cost: 0,
  });

  const { data: response, isLoading, error } = useInventoryItems(filters);
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();
  const deleteMutation = useDeleteInventoryItem();

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      main_category: filters.main_category,
      page: 1,
      limit: 50,
    });
  };

  const handleCategoryChange = (category: string) => {
    setFilters({
      main_category: category,
      page: 1,
      limit: 50,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, data: formData },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingItem(null);
            resetForm();
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          setIsModalOpen(false);
          resetForm();
        },
      });
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      item_code: item.item_code,
      item_name: item.item_name,
      main_category: item.main_category || 'paper',
      category: item.category,
      subcategory: item.subcategory || '',
      unit: item.unit,
      gsm: item.gsm,
      size: item.size,
      size_length: item.size_length,
      size_width: item.size_width,
      material_type: item.material_type,
      brand: item.brand,
      color: item.color,
      current_stock: item.current_stock,
      reorder_level: item.reorder_level,
      reorder_quantity: item.reorder_quantity,
      unit_cost: item.unit_cost,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this item?');
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      item_code: '',
      item_name: '',
      main_category: 'paper',
      category: InventoryCategory.PAPER,
      subcategory: '',
      unit: 'kg',
      current_stock: 0,
      reorder_level: 0,
      reorder_quantity: 0,
      unit_cost: 0,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          Error loading inventory items
        </div>
      </div>
    );
  }

  const items: InventoryItem[] = response?.data || [];
  const total = response?.total || 0;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="mt-2 text-gray-600">Manage stock levels and materials</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingItem(null);
            resetForm();
            setIsModalOpen(true);
          }}
        >
          Add Item
        </Button>
      </div>

      <CategoryTabs activeCategory={filters.main_category || 'paper'} onCategoryChange={handleCategoryChange} />

      <CommonFilters filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />

      {filters.main_category === 'paper' && (
        <PaperFilters filters={filters} onFilterChange={handleFilterChange} />
      )}

      {filters.main_category === 'other_material' && (
        <OtherMaterialFilters filters={filters} onFilterChange={handleFilterChange} />
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                {filters.main_category === 'paper' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GSM</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material Type</th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-4 text-center text-gray-500">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLowStock = item.current_stock <= item.reorder_level;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.item_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.item_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${categoryColors[item.category]}`}>
                          {item.category.replace('_', ' ')}
                        </span>
                      </td>
                      {filters.main_category === 'paper' && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.size || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.gsm ? `${item.gsm} GSM` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.material_type || '-'}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.brand || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.color || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={isLowStock ? 'text-red-600 font-semibold' : ''}>
                          {item.current_stock} {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.reorder_level} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{item.unit_cost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing {items.length} of {total} items
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
            disabled={!filters.page || filters.page <= 1}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
            disabled={items.length < (filters.limit || 50)}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
            resetForm();
          }}
          title={editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Item Code *"
                required
                value={formData.item_code}
                onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
              />
              <Input
                label="Item Name *"
                required
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              />
              <Select
                label="Main Category *"
                options={[
                  { value: 'block', label: 'Block' },
                  { value: 'paper', label: 'Paper' },
                  { value: 'other_material', label: 'Other Material' },
                ]}
                value={formData.main_category}
                onChange={(e) => setFormData({ ...formData, main_category: e.target.value as any })}
              />
              <Select
                label="Category *"
                options={[
                  { value: InventoryCategory.PAPER, label: 'Paper' },
                  { value: InventoryCategory.INK, label: 'Ink' },
                  { value: InventoryCategory.PLATES, label: 'Plates' },
                  { value: InventoryCategory.FINISHING_MATERIALS, label: 'Finishing Materials' },
                  { value: InventoryCategory.PACKAGING, label: 'Packaging' },
                ]}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryCategory })}
              />
              <Input
                label="Subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              />
              <Select
                label="Unit *"
                options={[
                  { value: 'kg', label: 'Kg' },
                  { value: 'liters', label: 'Liters' },
                  { value: 'pieces', label: 'Pieces' },
                  { value: 'reams', label: 'Reams' },
                  { value: 'boxes', label: 'Boxes' },
                ]}
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />

              {formData.main_category === 'paper' && (
                <>
                  <Select
                    label="Size"
                    options={[
                      { value: '', label: 'Select Size' },
                      { value: 'A4', label: 'A4' },
                      { value: 'A3', label: 'A3' },
                      { value: 'A5', label: 'A5' },
                      { value: 'custom', label: 'Custom' },
                    ]}
                    value={formData.size || ''}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  />
                  <Input
                    label="GSM"
                    type="number"
                    value={formData.gsm || ''}
                    onChange={(e) => setFormData({ ...formData, gsm: e.target.value ? Number(e.target.value) : undefined })}
                  />
                  <Input
                    label="Material Type"
                    value={formData.material_type || ''}
                    onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                    placeholder="e.g., Art Paper, Bond, Cardstock"
                  />
                </>
              )}

              <Input
                label="Brand"
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
              <Input
                label="Color"
                value={formData.color || ''}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
              <Input
                label="Current Stock *"
                type="number"
                required
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: Number(e.target.value) })}
              />
              <Input
                label="Reorder Level *"
                type="number"
                required
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: Number(e.target.value) })}
              />
              <Input
                label="Reorder Quantity *"
                type="number"
                required
                value={formData.reorder_quantity}
                onChange={(e) => setFormData({ ...formData, reorder_quantity: Number(e.target.value) })}
              />
              <Input
                label="Unit Cost *"
                type="number"
                required
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: Number(e.target.value) })}
              />
            </div>

            {(createMutation.isError || updateMutation.isError) && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                Error {editingItem ? 'updating' : 'creating'} inventory item
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingItem
                  ? 'Update Item'
                  : 'Create Item'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
