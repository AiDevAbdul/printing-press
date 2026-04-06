import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Grid3x3, List, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { CustomersGrid } from './CustomersGrid';
import { CustomersList } from './CustomersList';
import { CustomerProfile } from './CustomerProfile';

interface Customer {
  id: string;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  credit_limit: number;
  is_active: boolean;
  created_at: string;
}

interface CustomerFormData {
  name: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  gstin: string;
  credit_limit: number;
}

export default function Customers() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'credit'>('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    gstin: '',
    credit_limit: 0,
  });

  const queryClient = useQueryClient();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['customers', search],
    queryFn: async () => {
      const response = await api.get('/customers', {
        params: { search },
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      if (selectedCustomerId) {
        const response = await api.put(`/customers/${selectedCustomerId}`, data);
        return response.data;
      } else {
        const response = await api.post('/customers', data);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsModalOpen(false);
      setSelectedCustomerId(null);
      setFormData({
        name: '',
        company_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        gstin: '',
        credit_limit: 0,
      });
    },
  });

  const sortCustomers = (customers: Customer[]) => {
    const sorted = [...customers];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'created':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'credit':
        return sorted.sort((a, b) => b.credit_limit - a.credit_limit);
      default:
        return sorted;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleViewCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomerId(customerId);
      setFormData({
        name: customer.name,
        company_name: customer.company_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || '',
        city: customer.city,
        state: customer.state,
        postal_code: customer.postal_code || '',
        gstin: customer.gstin || '',
        credit_limit: customer.credit_limit,
      });
      setIsModalOpen(true);
    }
  };

  const handleAddCustomer = () => {
    setSelectedCustomerId(null);
    setFormData({
      name: '',
      company_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      gstin: '',
      credit_limit: 0,
    });
    setIsModalOpen(true);
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
          Error loading customers
        </div>
      </div>
    );
  }

  const customers: Customer[] = response?.data || [];
  const sortedCustomers = sortCustomers(customers);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-64"
        />

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronDown className="w-4 h-4" />}
            >
              Sort
            </Button>
            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => setSortBy('name')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'name' ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                Name (A-Z)
              </button>
              <button
                onClick={() => setSortBy('created')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'created' ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                Recently Added
              </button>
              <button
                onClick={() => setSortBy('credit')}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'credit' ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                Credit Limit
              </button>
            </div>
          </div>

          {/* View Mode Buttons */}
          <div className="flex gap-1 border border-gray-200 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              icon={<Grid3x3 className="w-4 h-4" />}
              onClick={() => setViewMode('grid')}
            />
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              icon={<List className="w-4 h-4" />}
              onClick={() => setViewMode('list')}
            />
          </div>

          {/* Add Customer Button */}
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddCustomer}
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <CustomersGrid
          customers={sortedCustomers}
          isLoading={isLoading}
          onViewCustomer={handleViewCustomer}
        />
      ) : (
        <CustomersList
          customers={sortedCustomers}
          isLoading={isLoading}
          onViewCustomer={handleViewCustomer}
        />
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedCustomerId ? 'Edit Customer Profile' : 'Add New Customer'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name *"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Company Name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
              <Input
                label="Email *"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Phone *"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <div className="md:col-span-2">
                <Input
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
              <Input
                label="Postal Code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              />
              <Input
                label="GSTIN"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              />
              <Input
                label="Credit Limit"
                type="number"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: Number(e.target.value) })}
              />
            </div>

            {createMutation.isError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                Error {selectedCustomerId ? 'updating' : 'creating'} customer
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Saving...' : selectedCustomerId ? 'Update Customer' : 'Create Customer'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
