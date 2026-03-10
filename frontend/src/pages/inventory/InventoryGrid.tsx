import { Package, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export interface InventoryGridProps {
  items: any[];
  isLoading?: boolean;
  onEdit?: (item: any) => void;
  onDelete?: (itemId: string) => void;
}

export function InventoryGrid({
  items,
  isLoading = false,
  onEdit,
  onDelete,
}: InventoryGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Package />}
        title="No inventory items found"
        description="Add your first inventory item to get started"
      />
    );
  }

  const getStockStatus = (currentStock: number, reorderLevel: number) => {
    const percentage = (currentStock / reorderLevel) * 100;
    if (percentage <= 50) return { status: 'critical', color: 'bg-red-600', label: 'Critical' };
    if (percentage <= 100) return { status: 'low', color: 'bg-yellow-600', label: 'Low Stock' };
    return { status: 'good', color: 'bg-green-600', label: 'Good' };
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      paper: 'bg-blue-100 text-blue-800',
      ink: 'bg-purple-100 text-purple-800',
      plates: 'bg-green-100 text-green-800',
      finishing_materials: 'bg-yellow-100 text-yellow-800',
      packaging: 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const isLowStock = item.current_stock <= item.reorder_level;
        const stockStatus = getStockStatus(item.current_stock, item.reorder_level);
        const stockPercentage = Math.min(
          (item.current_stock / (item.reorder_level * 2)) * 100,
          100
        );

        return (
          <Card
            key={item.id}
            variant="elevated"
            padding="md"
            hover
            className={isLowStock ? 'border-l-4 border-l-red-500' : ''}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">
                    {item.item_code}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {item.item_name}
                  </p>
                </div>
                {isLowStock && (
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(
                    item.category
                  )}`}
                >
                  {item.category.replace('_', ' ')}
                </span>
              </div>

              {/* Stock Level Visualization */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Stock Level</span>
                  <span className="font-medium">
                    {item.current_stock} / {item.reorder_level * 2} {item.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${stockStatus.color}`}
                    style={{ width: `${stockPercentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    Reorder: {item.reorder_level} {item.unit}
                  </span>
                  <Badge
                    variant={
                      stockStatus.status === 'critical'
                        ? 'status'
                        : stockStatus.status === 'low'
                        ? 'status'
                        : 'default'
                    }
                    status={
                      stockStatus.status === 'critical'
                        ? 'cancelled'
                        : stockStatus.status === 'low'
                        ? 'pending'
                        : 'completed'
                    }
                  >
                    {stockStatus.label}
                  </Badge>
                </div>
              </div>

              {/* Item Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {item.gsm && (
                  <div>
                    <p className="text-xs text-gray-500">GSM</p>
                    <p className="font-medium text-gray-900">{item.gsm}</p>
                  </div>
                )}
                {item.size && (
                  <div>
                    <p className="text-xs text-gray-500">Size</p>
                    <p className="font-medium text-gray-900">{item.size}</p>
                  </div>
                )}
                {item.brand && (
                  <div>
                    <p className="text-xs text-gray-500">Brand</p>
                    <p className="font-medium text-gray-900 truncate">{item.brand}</p>
                  </div>
                )}
                {item.color && (
                  <div>
                    <p className="text-xs text-gray-500">Color</p>
                    <p className="font-medium text-gray-900 truncate">{item.color}</p>
                  </div>
                )}
              </div>

              {/* Unit Cost */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Unit Cost</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{item.unit_cost.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">Total Value</span>
                  <span className="text-sm font-semibold text-blue-600">
                    ₹{(item.current_stock * item.unit_cost).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  icon={<Edit className="w-4 h-4" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(item);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(item.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
