import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

interface Invoice {
  id: string;
  invoice_number: string;
  customer: {
    name: string;
    company_name: string;
  };
  order: {
    order_number: string;
  };
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: string;
  company_name?: string;
  group_name?: string;
  product_type?: string;
  final_quantity?: number;
  unit_rate?: number;
  strength?: string;
  sales_tax_applicable?: boolean;
}

interface Order {
  id: string;
  order_number: string;
  product_name: string;
  final_price: number;
  customer_id: string;
  customer: {
    id: string;
    name: string;
    company_name?: string;
  };
  quantity: number;
  product_type?: string;
  strength?: string;
}

interface InvoiceFormData {
  order_id: string;
  customer_id: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  notes: string;
  company_name: string;
  group_name: string;
  product_type: string;
  final_quantity: number;
  unit_rate: number;
  strength: string;
  sales_tax_applicable: boolean;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Invoices() {
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>({
    order_id: '',
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    subtotal: 0,
    tax_rate: 0,
    notes: '',
    company_name: '',
    group_name: '',
    product_type: '',
    final_quantity: 0,
    unit_rate: 0,
    strength: '',
    sales_tax_applicable: false,
    items: [],
  });

  const queryClient = useQueryClient();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: async () => {
      const response = await api.get('/invoices', {
        params: statusFilter ? { status: statusFilter } : {},
      });
      return response.data;
    },
  });

  const { data: ordersResponse } = useQuery({
    queryKey: ['orders-for-invoice'],
    queryFn: async () => {
      const response = await api.get('/orders');
      return response.data;
    },
    enabled: isModalOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      // Convert date strings to ISO format for backend
      const payload = {
        ...data,
        invoice_date: new Date(data.invoice_date).toISOString(),
        due_date: new Date(data.due_date).toISOString(),
      };
      console.log('Sending invoice payload:', payload);
      const response = await api.post('/invoices', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsModalOpen(false);
      setFormData({
        order_id: '',
        customer_id: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        subtotal: 0,
        tax_rate: 0,
        notes: '',
        company_name: '',
        group_name: '',
        product_type: '',
        final_quantity: 0,
        unit_rate: 0,
        strength: '',
        sales_tax_applicable: false,
        items: [],
      });
    },
    onError: (error: any) => {
      console.error('Invoice creation error:', error.response?.data || error);
      console.error('Error messages:', error.response?.data?.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure items array is not empty
    if (formData.items.length === 0) {
      alert('Please select an order first to generate invoice items');
      return;
    }

    // Ensure customer_id is present
    if (!formData.customer_id) {
      alert('Customer ID is missing. Please select an order with a valid customer.');
      return;
    }

    // Ensure all numeric fields are numbers
    const payload = {
      ...formData,
      subtotal: Number(formData.subtotal),
      tax_rate: Number(formData.tax_rate),
      items: formData.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
      }))
    };

    createMutation.mutate(payload);
  };

  const handleOrderChange = (orderId: string) => {
    const selectedOrder = ordersResponse?.data?.find((o: Order) => o.id === orderId);
    if (selectedOrder) {
      const customerId = selectedOrder.customer_id || selectedOrder.customer?.id;
      const finalPrice = Number(selectedOrder.final_price) || 0;
      const quantity = Number(selectedOrder.quantity) || 1;
      const unitRate = quantity > 0 ? finalPrice / quantity : finalPrice;

      console.log('Selected order:', selectedOrder);
      console.log('Customer ID:', customerId);

      setFormData(prev => ({
        ...prev,
        order_id: orderId,
        customer_id: customerId,
        subtotal: finalPrice,
        company_name: selectedOrder.customer?.company_name || '',
        group_name: '',
        product_type: selectedOrder.product_type || '',
        final_quantity: quantity,
        unit_rate: unitRate,
        strength: selectedOrder.strength || '',
        items: [{
          description: selectedOrder.product_name,
          quantity: quantity,
          unit_price: unitRate,
        }]
      }));
    }
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
          Error loading invoices
        </div>
      </div>
    );
  }

  const invoices: Invoice[] = response?.data || [];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-2 text-gray-600">Manage invoices and payments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          Add Invoice
        </button>
      </div>

      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{invoice.customer.name}</div>
                      {invoice.company_name && (
                        <div className="text-xs text-gray-500">{invoice.company_name}</div>
                      )}
                      {invoice.group_name && (
                        <div className="text-xs text-gray-400">{invoice.group_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {invoice.product_type && (
                        <div className="font-medium">{invoice.product_type}</div>
                      )}
                      {invoice.strength && (
                        <div className="text-xs text-gray-500">{invoice.strength}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.final_quantity ? invoice.final_quantity.toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₨{invoice.total_amount.toLocaleString()}
                      {invoice.unit_rate && (
                        <div className="text-xs text-gray-500">@₨{invoice.unit_rate.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {invoice.sales_tax_applicable ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[invoice.status]}`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Invoice</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order *</label>
                  <select
                    required
                    value={formData.order_id}
                    onChange={(e) => handleOrderChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Order</option>
                    {ordersResponse?.data?.map((order: Order) => (
                      <option key={order.id} value={order.id}>
                        {order.order_number} - {order.product_name} (₹{order.final_price?.toLocaleString() || 0})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Full legal company name"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    value={formData.group_name}
                    onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Parent organization or group"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                  <input
                    type="text"
                    value={formData.product_type}
                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Carton, Label, Leaflet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Strength</label>
                  <input
                    type="text"
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 500mg, 10ml"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Final Quantity</label>
                  <input
                    type="number"
                    value={formData.final_quantity}
                    onChange={(e) => setFormData({ ...formData, final_quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Delivered quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_rate}
                    onChange={(e) => setFormData({ ...formData, unit_rate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Price per unit"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.sales_tax_applicable}
                      onChange={(e) => setFormData({ ...formData, sales_tax_applicable: e.target.checked })}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Sales Tax Applicable</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal *</label>
                  <input
                    type="number"
                    required
                    value={formData.subtotal}
                    onChange={(e) => setFormData({ ...formData, subtotal: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <input
                    type="number"
                    disabled
                    value={(formData.subtotal * (1 + formData.tax_rate / 100)).toFixed(2)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
              {createMutation.isError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  Error creating invoice
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
