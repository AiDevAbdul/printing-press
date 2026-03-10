import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Modal, ModalBody, ModalFooter } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => Promise<void>;
  initialData?: any;
  isLoading?: boolean;
}

export function OrderForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: OrderFormProps) {
  const [formData, setFormData] = useState({
    customer_id: initialData?.customer_id || '',
    order_date: initialData?.order_date || new Date().toISOString().split('T')[0],
    delivery_date: initialData?.delivery_date || '',
    priority: initialData?.priority || 'medium',
    product_name: initialData?.product_name || '',
    product_type: initialData?.product_type || 'business_cards',
    quantity: initialData?.quantity || '',
    unit: initialData?.unit || 'pieces',
    specifications: initialData?.specifications || '',
    amount: initialData?.amount || '',
    special_instructions: initialData?.special_instructions || '',
    terms_accepted: initialData?.terms_accepted || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
    if (!formData.delivery_date) newErrors.delivery_date = 'Delivery date is required';
    if (!formData.product_name) newErrors.product_name = 'Product name is required';
    if (!formData.quantity) newErrors.quantity = 'Quantity is required';
    if (!formData.amount) newErrors.amount = 'Amount is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Type coercion for form data
      const submitData = {
        ...formData,
        quantity: Number(formData.quantity),
        amount: Number(formData.amount),
        order_date: new Date(formData.order_date).toISOString(),
        delivery_date: new Date(formData.delivery_date).toISOString(),
      };

      await onSubmit?.(submitData);
      toast.success('Order created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Order' : 'Create New Order'}
      size="lg"
      footer={
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {initialData ? 'Update Order' : 'Create Order'}
          </Button>
        </ModalFooter>
      }
    >
      <ModalBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Customer *"
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                error={errors.customer_id}
                options={[
                  { value: '', label: 'Select a customer' },
                  { value: 'cust-001', label: 'ABC Corporation' },
                  { value: 'cust-002', label: 'XYZ Industries' },
                  { value: 'cust-003', label: 'Tech Solutions Ltd' },
                ]}
              />
              <Select
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
              />
              <Input
                label="Order Date"
                type="date"
                name="order_date"
                value={formData.order_date}
                onChange={handleChange}
              />
              <Input
                label="Delivery Date *"
                type="date"
                name="delivery_date"
                value={formData.delivery_date}
                onChange={handleChange}
                error={errors.delivery_date}
              />
            </div>
          </div>

          {/* Section 2: Product Details */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Product Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Product Name *"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                placeholder="e.g., Business Cards, Brochures"
                error={errors.product_name}
              />
              <Select
                label="Product Type"
                name="product_type"
                value={formData.product_type}
                onChange={handleChange}
                options={[
                  { value: 'business_cards', label: 'Business Cards' },
                  { value: 'brochures', label: 'Brochures' },
                  { value: 'flyers', label: 'Flyers' },
                  { value: 'banners', label: 'Banners' },
                  { value: 'labels', label: 'Labels' },
                  { value: 'packaging', label: 'Packaging' },
                ]}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Quantity *"
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  error={errors.quantity}
                />
                <Select
                  label="Unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  options={[
                    { value: 'pieces', label: 'Pieces' },
                    { value: 'boxes', label: 'Boxes' },
                    { value: 'reams', label: 'Reams' },
                    { value: 'sets', label: 'Sets' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Specifications */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Specifications
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specifications
                </label>
                <textarea
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  placeholder="e.g., Size, Color, Material, Finish..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Pricing & Instructions */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pricing & Instructions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Amount (₹) *"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                error={errors.amount}
              />
              <div></div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  name="special_instructions"
                  value={formData.special_instructions}
                  onChange={handleChange}
                  placeholder="Any special requirements or notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Terms */}
          <div>
            <Checkbox
              label="I accept the terms and conditions"
              name="terms_accepted"
              checked={formData.terms_accepted}
              onChange={handleChange}
            />
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}
