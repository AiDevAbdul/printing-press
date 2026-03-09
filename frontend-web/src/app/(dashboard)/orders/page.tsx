'use client';

import { useState } from 'react';
import { useDataFetch } from '@/lib/fetcher';

interface Order {
  id: string;
  order_number: string;
  customer: { name: string };
  product_name: string;
  status: 'pending' | 'approved' | 'in_production' | 'completed' | 'delivered' | 'cancelled';
  final_price: number;
  created_at: string;
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Using the custom fetcher hook (this will hit the mock/real backend)
  const { data: orders, isLoading } = useDataFetch<Order[]>('/orders');

  // fallback data for demonstration if backend is not running
  const mockOrders: Order[] = [
    { id: '1', order_number: 'ORD-2026-001', customer: { name: 'TechCorp Packaging' }, product_name: 'Q1 Catalog', status: 'in_production', final_price: 1250, created_at: '2026-03-01' },
    { id: '2', order_number: 'ORD-2026-002', customer: { name: 'Local Retailers' }, product_name: 'Flyers Promo', status: 'pending', final_price: 450, created_at: '2026-03-05' },
    { id: '3', order_number: 'ORD-2026-003', customer: { name: 'Event Flyers' }, product_name: 'Music Fest', status: 'completed', final_price: 89, created_at: '2026-03-08' },
  ];

  const realOrders = ((orders as any)?.data as Order[]) || (Array.isArray(orders) ? orders : null);
  const baseOrders = realOrders || mockOrders;

  // Filtering Logic
  const filteredOrders = baseOrders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && ['pending', 'approved', 'in_production'].includes(order.status)) ||
      (statusFilter === 'completed' && ['completed', 'delivered'].includes(order.status));

    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = () => {
    alert('Create New Order functionality coming soon!');
  };

  const handleViewDetails = (id: string) => {
    alert(`Viewing details for order ID: ${id}`);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1>Orders Management</h1>
          <p className="text-secondary">Track and manage your printing orders</p>
        </div>
        <button onClick={handleCreateOrder} className="btn btn-primary">+ Create New Order</button>
      </div>

      <div className="glass p-6" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="flex-between mb-6">
           <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setStatusFilter('all')}
                style={{ 
                  borderBottom: statusFilter === 'all' ? '2px solid var(--primary-color)' : 'none', 
                  borderRadius: '0',
                  color: statusFilter === 'all' ? 'var(--primary-color)' : 'var(--text-secondary)'
                }}
              >
                All Orders
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => setStatusFilter('active')}
                style={{ 
                  borderBottom: statusFilter === 'active' ? '2px solid var(--primary-color)' : 'none', 
                  borderRadius: '0',
                  color: statusFilter === 'active' ? 'var(--primary-color)' : 'var(--text-secondary)'
                }}
              >
                Active
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => setStatusFilter('completed')}
                style={{ 
                  borderBottom: statusFilter === 'completed' ? '2px solid var(--primary-color)' : 'none', 
                  borderRadius: '0',
                  color: statusFilter === 'completed' ? 'var(--primary-color)' : 'var(--text-secondary)'
                }}
              >
                Completed
              </button>
           </div>
           <div className="flex-center" style={{ gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="input-field" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.4rem 1rem' }}
              />
              <button className="btn btn-outline">Filters</button>
           </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Project</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? filteredOrders.map((order: Order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>{order.order_number}</td>
                  <td>{order.customer?.name || 'N/A'}</td>
                  <td>{order.product_name}</td>
                  <td>
                    <span className={`badge ${
                      order.status === 'in_production' ? 'badge-warning' : 
                      order.status === 'completed' || order.status === 'delivered' ? 'badge-success' : 
                      order.status === 'pending' ? 'badge-info' : 'badge-info'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>${Number(order.final_price).toFixed(2)}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => handleViewDetails(order.id)}
                      className="text-primary" 
                      style={{ fontWeight: 600, fontSize: '0.75rem' }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
