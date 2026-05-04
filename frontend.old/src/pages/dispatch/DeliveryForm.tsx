import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dispatchService } from '../../services/dispatch.service';
import { productionService } from '../../services/production.service';
import { customerService } from '../../services/customer.service';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { X, Search } from 'lucide-react';

interface DeliveryFormProps {
  onClose: () => void;
}

const DeliveryForm = ({ onClose }: DeliveryFormProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    job_id: '',
    customer_id: '',
    delivery_type: 'courier',
    scheduled_date: '',
    courier_name: '',
    tracking_number: '',
    vehicle_number: '',
    driver_name: '',
    driver_phone: '',
    delivery_address: '',
    delivery_contact_name: '',
    delivery_contact_phone: '',
    delivery_notes: '',
  });

  const [jobSearch, setJobSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Fetch jobs
  const { data: jobsData } = useQuery({
    queryKey: ['production-jobs', jobSearch],
    queryFn: () =>
      productionService.getAll(undefined, undefined, undefined, undefined, 1, 50),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch customers
  const { data: customersData } = useQuery({
    queryKey: ['customers', customerSearch],
    queryFn: () => customerService.getAll(customerSearch || undefined, 1, 50),
    staleTime: 5 * 60 * 1000,
  });

  const jobs = jobsData?.data || [];
  const customers = customersData?.data || [];

  // Filter jobs based on search
  const filteredJobs = useMemo(() => {
    if (!jobSearch) return jobs;
    return jobs.filter(
      (job) =>
        job.job_number.toLowerCase().includes(jobSearch.toLowerCase()) ||
        job.order?.product_name?.toLowerCase().includes(jobSearch.toLowerCase())
    );
  }, [jobs, jobSearch]);

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    return customers.filter(
      (customer) =>
        customer.company_name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.name?.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [customers, customerSearch]);

  // Get selected job details
  const selectedJob = jobs.find((j) => j.id === formData.job_id);
  const selectedCustomer = customers.find((c) => c.id === formData.customer_id);

  const createMutation = useMutation({
    mutationFn: dispatchService.createDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      toast.success('Delivery created successfully');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create delivery');
    },
  });

  const handleSelectJob = (job: any) => {
    setFormData({
      ...formData,
      job_id: job.id,
      customer_id: job.order?.customer?.id || '',
    });
    setJobSearch('');
    setShowJobDropdown(false);
  };

  const handleSelectCustomer = (customer: any) => {
    setFormData({
      ...formData,
      customer_id: customer.id,
      delivery_address: customer.address || '',
      delivery_contact_name: customer.name || '',
      delivery_contact_phone: customer.phone || '',
    });
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.job_id) {
      toast.error('Please select a job');
      return;
    }
    if (!formData.customer_id) {
      toast.error('Please select a customer');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto pt-4 pb-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">New Delivery</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Selection */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Job *</label>
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search job number or product..."
                  value={jobSearch || (selectedJob?.job_number || '')}
                  onChange={(e) => {
                    setJobSearch(e.target.value);
                    setShowJobDropdown(true);
                  }}
                  onFocus={() => setShowJobDropdown(true)}
                  className="flex-1 outline-none bg-transparent"
                />
                {formData.job_id && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, job_id: '' });
                      setJobSearch('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {showJobDropdown && filteredJobs.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredJobs.map((job) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => handleSelectJob(job)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0"
                    >
                      <div className="font-medium text-sm">{job.job_number}</div>
                      <div className="text-xs text-gray-600">
                        {job.order?.product_name} - {job.order?.customer?.company_name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedJob && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                <div className="font-medium">{selectedJob.job_number}</div>
                <div className="text-gray-600">{selectedJob.order?.product_name}</div>
              </div>
            )}
          </div>

          {/* Customer Selection */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Customer *</label>
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customer name or company..."
                  value={customerSearch || (selectedCustomer?.company_name || '')}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="flex-1 outline-none bg-transparent"
                />
                {formData.customer_id && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, customer_id: '' });
                      setCustomerSearch('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => handleSelectCustomer(customer)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0"
                    >
                      <div className="font-medium text-sm">{customer.company_name}</div>
                      <div className="text-xs text-gray-600">{customer.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedCustomer && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                <div className="font-medium">{selectedCustomer.company_name}</div>
                <div className="text-gray-600">{selectedCustomer.phone}</div>
              </div>
            )}
          </div>

          {/* Delivery Type & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Type *</label>
              <select
                value={formData.delivery_type}
                onChange={(e) => setFormData({ ...formData, delivery_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="courier">Courier</option>
                <option value="own_transport">Own Transport</option>
                <option value="customer_pickup">Customer Pickup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Scheduled Date *</label>
              <input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Courier Details */}
          {formData.delivery_type === 'courier' && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <label className="block text-sm font-medium mb-1">Courier Name</label>
                <input
                  type="text"
                  value={formData.courier_name}
                  onChange={(e) => setFormData({ ...formData, courier_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={formData.tracking_number}
                  onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Own Transport Details */}
          {formData.delivery_type === 'own_transport' && (
            <div className="grid grid-cols-3 gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Number</label>
                <input
                  type="text"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Driver Name</label>
                <input
                  type="text"
                  value={formData.driver_name}
                  onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Driver Phone</label>
                <input
                  type="text"
                  value={formData.driver_phone}
                  onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Delivery Address */}
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Address *</label>
            <textarea
              value={formData.delivery_address}
              onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.delivery_contact_name}
                onChange={(e) => setFormData({ ...formData, delivery_contact_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.delivery_contact_phone}
                onChange={(e) => setFormData({ ...formData, delivery_contact_phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.delivery_notes}
              onChange={(e) => setFormData({ ...formData, delivery_notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Delivery'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryForm;
