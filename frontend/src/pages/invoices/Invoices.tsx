import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { SortButton } from '../../components/ui/SortButton';
import { InvoicesGrid } from './InvoicesGrid';
import { InvoiceView } from '../../components/invoices/InvoiceView';
import { useSorting } from '../../hooks/useSorting';

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

export default function Invoices() {
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
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

  const invoices: Invoice[] = response?.data || [];
  const { sortedItems, sortConfig, toggleSort } = useSorting(invoices, 'invoice_date');

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
      toast.success('Invoice created successfully');
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
      toast.error('Failed to create invoice');
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await api.patch(`/invoices/${invoiceId}/mark-paid`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice marked as paid');
      setSelectedInvoice(null);
    },
    onError: (error: any) => {
      console.error('Mark paid error:', error.response?.data || error);
      toast.error('Failed to mark invoice as paid');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure items array is not empty
    if (formData.items.length === 0) {
      toast.error('Please select an order first to generate invoice items');
      return;
    }

    // Ensure customer_id is present
    if (!formData.customer_id) {
      toast.error('Customer ID is missing. Please select an order with a valid customer.');
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

  return (
    <div className="space-y-6">
      {/* Filters & Sort */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
        <div className="flex-1">
          <Select
            label="Filter by Status"
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'draft', label: 'Draft' },
              { value: 'sent', label: 'Sent' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <SortButton
            label="Latest"
            isActive={sortConfig.key === 'invoice_date'}
            sortOrder={sortConfig.order}
            onClick={() => toggleSort('invoice_date')}
          />
          <SortButton
            label="Amount"
            isActive={sortConfig.key === 'total_amount'}
            sortOrder={sortConfig.order}
            onClick={() => toggleSort('total_amount')}
          />
          <SortButton
            label="Due Date"
            isActive={sortConfig.key === 'due_date'}
            sortOrder={sortConfig.order}
            onClick={() => toggleSort('due_date')}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : error ? (
        <EmptyState
          icon="AlertCircle"
          title="Error loading invoices"
          description="There was an error loading the invoices. Please try again."
        />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon="FileText"
          title="No invoices found"
          description="Get started by creating your first invoice."
          action={{
            label: 'Add Invoice',
            onClick: () => setIsModalOpen(true),
          }}
        />
      ) : (
        <InvoicesGrid
          invoices={sortedItems}
          isLoading={isLoading}
          onInvoiceClick={(invoice) => setSelectedInvoice(invoice)}
        />
      )}

      {/* Invoice View Modal */}
      {selectedInvoice && (
        <InvoiceView
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onMarkPaid={(invoiceId) => markPaidMutation.mutate(invoiceId)}
          isMarkingPaid={markPaidMutation.isPending}
        />
      )}

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Invoice"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Order *"
            options={[
              { value: '', label: 'Select Order' },
              ...(ordersResponse?.data?.map((order: Order) => ({
                value: order.id,
                label: `${order.order_number} - ${order.product_name} (₹${order.final_price?.toLocaleString() || 0})`,
              })) || []),
            ]}
            value={formData.order_id}
            onChange={(e) => handleOrderChange(e.target.value)}
          />

          <Input
            label="Company Name"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            placeholder="Full legal company name"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Invoice Date *"
              type="date"
              required
              value={formData.invoice_date}
              onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
            />
            <Input
              label="Due Date *"
              type="date"
              required
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Subtotal *"
              type="number"
              required
              value={formData.subtotal}
              onChange={(e) => setFormData({ ...formData, subtotal: Number(e.target.value) })}
            />
            <Input
              label="Tax Rate (%)"
              type="number"
              value={formData.tax_rate}
              onChange={(e) => setFormData({ ...formData, tax_rate: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Total Amount"
            type="number"
            disabled
            value={(formData.subtotal * (1 + formData.tax_rate / 100)).toFixed(2)}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>

          {createMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              Error creating invoice
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
