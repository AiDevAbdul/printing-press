import { X } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return 'N/A';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const DetailRow = ({ label, value }: { label: string; value: any }) => {
    if (!value || value === '' || (Array.isArray(value) && value.length === 0)) return null;

    return (
      <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 last:border-0">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="text-sm text-gray-900 col-span-2">
          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
        </dd>
      </div>
    );
  };

  const Section = ({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>{emoji}</span>
          {title}
        </h3>
        <dl className="space-y-0">{children}</dl>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{order.order_number}</h2>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="status" status={order.status}>
                {order.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge variant="priority" priority={order.priority}>
                {order.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <Section title="Basic Information" emoji="📋">
                <DetailRow label="Order Number" value={order.order_number} />
                <DetailRow label="Customer" value={order.customer?.name} />
                <DetailRow label="Company" value={order.customer?.company_name} />
                <DetailRow label="Order Date" value={formatDate(order.order_date)} />
                <DetailRow label="Delivery Date" value={formatDate(order.delivery_date)} />
                <DetailRow label="Product Name" value={order.product_name} />
                <DetailRow label="Product Type" value={order.product_type?.replace('_', ' ').toUpperCase()} />
                <DetailRow label="Quantity" value={`${order.quantity} ${order.unit}`} />
                <DetailRow label="Repeat Order" value={order.is_repeat_order} />
              </Section>

              <Section title="Specifications" emoji="📐">
                <DetailRow label="Card Size" value={order.card_size} />
                <DetailRow label="Card Width" value={order.card_width} />
                <DetailRow label="Card Length" value={order.card_length} />
                <DetailRow label="Strength" value={order.strength} />
                <DetailRow label="Type" value={order.type} />
                <DetailRow label="Size (L×W)" value={order.size_length && order.size_width ? `${order.size_length} × ${order.size_width} ${order.size_unit || ''}` : null} />
                <DetailRow label="Substrate" value={order.substrate} />
                <DetailRow label="GSM" value={order.gsm} />
                <DetailRow label="Colors" value={order.colors} />
                <DetailRow label="Printing Type" value={order.printing_type?.toUpperCase()} />
                <DetailRow label="Batch Number" value={order.batch_number} />
                <DetailRow label="Group Name" value={order.group_name} />
                <DetailRow label="Specifications" value={order.specifications} />
              </Section>

              <Section title="Color Details" emoji="🎨">
                <DetailRow label="Cyan" value={order.color_cyan} />
                <DetailRow label="Magenta" value={order.color_magenta} />
                <DetailRow label="Yellow" value={order.color_yellow} />
                <DetailRow label="Black" value={order.color_black} />
                <DetailRow label="Pantone 1" value={order.color_p1} />
                <DetailRow label="Pantone 2" value={order.color_p2} />
                <DetailRow label="Pantone 3" value={order.color_p3} />
                <DetailRow label="Pantone 4" value={order.color_p4} />
              </Section>

              <Section title="Finishing Options" emoji="✨">
                <DetailRow label="Varnish Type" value={order.varnish_type?.join(', ').replace(/_/g, ' ').toUpperCase()} />
                <DetailRow label="Varnish Details" value={order.varnish_details} />
                <DetailRow label="Lamination Type" value={order.lamination_type?.join(', ').replace(/_/g, ' ').toUpperCase()} />
                <DetailRow label="Lamination Size" value={order.lamination_size} />
                <DetailRow label="UV/Emboss Details" value={order.uv_emboss_details} />
                <DetailRow label="Back Printing" value={order.has_back_printing} />
                <DetailRow label="Barcode" value={order.has_barcode} />
                <DetailRow label="Finishing Requirements" value={order.finishing_requirements} />
              </Section>
            </div>

            {/* Right Column */}
            <div>
              <Section title="Pre-Press Details" emoji="🖨️">
                <DetailRow label="CTP Info" value={order.ctp_info} />
                <DetailRow label="Die Type" value={order.die_type?.replace('_', ' ').toUpperCase()} />
                <DetailRow label="Die Reference" value={order.die_reference} />
                <DetailRow label="Emboss Film Details" value={order.emboss_film_details} />
                <DetailRow label="Plate Reference" value={order.plate_reference} />
              </Section>

              <Section title="Design Tracking" emoji="🎨">
                <DetailRow label="Designer Name" value={order.designer_name} />
                <DetailRow label="Design Approved By" value={order.design_approved_by} />
                <DetailRow label="Design Approved At" value={formatDate(order.design_approved_at)} />
              </Section>

              <Section title="Silvo/Blister Foil Details" emoji="🔧">
                <DetailRow label="Cylinder Reference" value={order.cylinder_reference} />
                <DetailRow label="Cylinder Sent Date" value={formatDate(order.cylinder_sent_date)} />
                <DetailRow label="Cylinder Approved Date" value={formatDate(order.cylinder_approved_date)} />
                <DetailRow label="Cylinder Received Date" value={formatDate(order.cylinder_received_date)} />
              </Section>

              <Section title="Bent Foil / Alu-Alu Details" emoji="📦">
                <DetailRow label="Thickness (Micron)" value={order.thickness_micron} />
                <DetailRow label="Tablet Size" value={order.tablet_size} />
                <DetailRow label="Punch Size" value={order.punch_size} />
              </Section>

              <Section title="Pricing" emoji="💰">
                <DetailRow label="Quoted Price" value={formatCurrency(order.quoted_price)} />
                <DetailRow label="Final Price" value={formatCurrency(order.final_price)} />
              </Section>

              <Section title="Production Status" emoji="⚙️">
                <DetailRow label="Production Status" value={order.production_status} />
                <DetailRow label="Auto Sync Enabled" value={order.auto_sync_enabled} />
              </Section>

              <Section title="Additional Information" emoji="📝">
                <DetailRow label="Special Instructions" value={order.special_instructions} />
                <DetailRow label="Created At" value={formatDate(order.created_at)} />
                <DetailRow label="Updated At" value={formatDate(order.updated_at)} />
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
