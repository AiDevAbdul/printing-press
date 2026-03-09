'use client';

import { useDataFetch } from '@/lib/fetcher';

interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  current_stock: number;
  unit: string;
  reorder_level: number;
  updated_at: string;
}

export default function InventoryPage() {
  const { data: inventory, isLoading } = useDataFetch<InventoryItem[]>('/inventory');

  const mockInventory: InventoryItem[] = [
    { id: '1', item_name: 'A4 Offset Paper 80gsm', category: 'paper', current_stock: 25000, unit: 'sheets', reorder_level: 5000, updated_at: '2026-03-09' },
    { id: '2', item_name: 'Cyan Ink - CMYK Premium', category: 'ink', current_stock: 12, unit: 'liters', reorder_level: 5, updated_at: '2026-03-08' },
    { id: '3', item_name: 'Magenta Ink - CMYK Premium', category: 'ink', current_stock: 4, unit: 'liters', reorder_level: 5, updated_at: '2026-03-08' },
  ];

  const realInventory = ((inventory as any)?.data as InventoryItem[]) || (Array.isArray(inventory) ? inventory : null);
  const displayInventory = realInventory || mockInventory;

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1>Inventory Management</h1>
          <p className="text-secondary">Track raw materials, stock levels, and supply alerts</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button className="btn btn-outline">Low Stock Alerts (1)</button>
           <button className="btn btn-primary">+ Update Stock</button>
        </div>
      </div>

      <div className="grid-cols-3 mb-8">
         <div className="glass p-6" style={{ borderRadius: 'var(--radius-lg)' }}>
            <p className="text-secondary mb-1">Total Stock Value</p>
            <h2 style={{ color: 'var(--primary-color)' }}>$124,500</h2>
         </div>
         <div className="glass p-6" style={{ borderRadius: 'var(--radius-lg)' }}>
            <p className="text-secondary mb-1">Items Below Threshold</p>
            <h2 style={{ color: 'var(--error-color)' }}>3 Items</h2>
         </div>
         <div className="glass p-6" style={{ borderRadius: 'var(--radius-lg)' }}>
            <p className="text-secondary mb-1">Pending Deliveries</p>
            <h2 style={{ color: 'var(--info-color)' }}>5 Shipments</h2>
         </div>
      </div>

      <div className="glass p-6" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>In Stock</th>
                <th>Status</th>
                <th>Last Restocked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayInventory.map((item: InventoryItem) => {
                const isLowStock = Number(item.current_stock) <= Number(item.reorder_level);
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.item_name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{item.category.replace('_', ' ')}</td>
                    <td>{Number(item.current_stock).toLocaleString()} {item.unit}</td>
                    <td>
                      <span className={`badge ${isLowStock ? 'badge-error' : 'badge-success'}`}>
                        {isLowStock ? 'Low Stock' : 'Optimized'}
                      </span>
                    </td>
                    <td>{new Date(item.updated_at).toLocaleDateString()}</td>
                    <td>
                       <button className="text-primary" style={{ fontWeight: 600, fontSize: '0.75rem' }}>Manage</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
