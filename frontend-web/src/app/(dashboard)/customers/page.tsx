'use client';

import { useDataFetch } from '@/lib/fetcher';

interface Customer {
  id: string;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  // These might be calculated or returned by a specific DTO
  active_orders?: number;
  total_revenue?: number;
}

export default function CustomersPage() {
  const { data: customers, isLoading } = useDataFetch<Customer[]>('/customers');

  const mockCustomers: Customer[] = [
    { id: '1', name: 'Alice Johnson', company_name: 'TechCorp Packaging', email: 'alice@techcorp.com', phone: '+1-555-0123', active_orders: 5, total_revenue: 15400 },
    { id: '2', name: 'Bob Smith', company_name: 'Local Retailers', email: 'bob@localretail.com', phone: '+1-555-0456', active_orders: 2, total_revenue: 3200 },
  ];

  const realCustomers = ((customers as any)?.data as Customer[]) || (Array.isArray(customers) ? customers : null);
  const displayCustomers = realCustomers || mockCustomers;

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1>Customer Relationship Management</h1>
          <p className="text-secondary">Manage your client database and order histories</p>
        </div>
        <button className="btn btn-primary">+ Add New Customer</button>
      </div>

      <div className="glass p-6" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="flex-between mb-6">
           <div className="flex-center" style={{ gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Search customers..." 
                className="input-field" 
                style={{ padding: '0.4rem 1rem', width: '300px' }}
              />
           </div>
           <button className="btn btn-outline">Export List</button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact Person</th>
                <th>Email / Phone</th>
                <th>Active Orders</th>
                <th>Total Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayCustomers.map((customer: Customer) => (
                <tr key={customer.id}>
                  <td style={{ fontWeight: 600 }}>{customer.company_name || 'Individual'}</td>
                  <td>{customer.name}</td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{customer.email}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{customer.phone}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">{customer.active_orders || 0}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>${(customer.total_revenue || 0).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                       <button className="text-primary" style={{ fontWeight: 600, fontSize: '0.75rem' }}>View Profile</button>
                       <button className="text-secondary" style={{ fontWeight: 600, fontSize: '0.75rem' }}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
