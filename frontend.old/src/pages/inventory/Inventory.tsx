import { useState } from 'react';
import { useInventoryItems, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem } from '../../hooks/useInventory';
import { InventoryItem, InventoryFilters, InventoryCategory } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { InventoryGrid } from './InventoryGrid';
import CategoryTabs from '../../components/inventory/CategoryTabs';
import PaperFilters from '../../components/inventory/PaperFilters';
import OtherMaterialFilters from '../../components/inventory/OtherMaterialFilters';
import CommonFilters from '../../components/inventory/CommonFilters';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

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

  const { data: response, isLoading } = useInventoryItems(filters);
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
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Item deleted successfully');
        },
        onError: () => {
          toast.error('Failed to delete item');
        },
      });
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

  const items: InventoryItem[] = response?.data || [];
  const total = response?.total || 0;

  return (
    <div className="space-y-6">
      <CategoryTabs activeCategory={filters.main_category || 'paper'} onCategoryChange={handleCategoryChange} />

      <div className="flex gap-2 justify-end">
        <Button
          variant="primary"
          size="md"
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

      <CommonFilters filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />

      {filters.main_category === 'paper' && (
        <PaperFilters filters={filters} onFilterChange={handleFilterChange} />
      )}

      {filters.main_category === 'other_material' && (
        <OtherMaterialFilters filters={filters} onFilterChange={handleFilterChange} />
      )}

      <InventoryGrid
        items={items}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing {items.length} of {total} items
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
            disabled={!filters.page || filters.page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
            disabled={items.length < (filters.limit || 50)}
          >
            Next
          </Button>
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
