import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationService, Quotation } from '../../services/quotation.service';
import { useNavigate } from 'react-router-dom';

interface QuotationDetailsProps {
  quotation: Quotation;
  onClose: () => void;
}

const QuotationDetails = ({ quotation, onClose }: QuotationDetailsProps) => {
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertData, setConvertData] = useState({
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: history } = useQuery({
    queryKey: ['quotation-history', quotation.id],
    queryFn: () => quotationService.getHistory(quotation.id),
  });

  const convertMutation = useMutation({
    mutationFn: () => quotationService.convertToOrder(quotation.id, convertData),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      alert(`Successfully converted to order ${order.order_number}`);
      navigate('/orders');
      onClose();
    },
  });

  const revisionMutation = useMutation({
    mutationFn: () => quotationService.createRevision(quotation.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      onClose();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => quotationService.reject(quotation.id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      onClose();
    },
  });

  const handleConvert = async () => {
    await convertMutation.mutateAsync();
  };

  const handleRevision = async () => {
    if (window.confirm('Create a new revision of this quotation?')) {
      await revisionMutation.mutateAsync();
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      await rejectMutation.mutateAsync(reason);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800',
      converted: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`px-3 py-1 text-sm rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {quotation.quotation_number}
                {quotation.version > 1 && (
                  <span className="ml-2 text-lg text-gray-500">v{quotation.version}</span>
                )}
              </h2>
              <div className="mt-2">{getStatusBadge(quotation.status)}</div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex space-x-2">
            {quotation.status === 'approved' && !quotation.converted_to_order_id && (
              <button
                onClick={() => setShowConvertModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Convert to Order
              </button>
            )}
            {quotation.status === 'sent' && (
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reject
              </button>
            )}
            {(quotation.status === 'approved' || quotation.status === 'rejected') && (
              <button
                onClick={handleRevision}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Revision
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer & Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Company:</span> {quotation.customer?.company_name}</p>
                <p><span className="font-medium">Contact:</span> {quotation.customer?.contact_person}</p>
                <p><span className="font-medium">Email:</span> {quotation.customer?.email}</p>
                <p><span className="font-medium">Phone:</span> {quotation.customer?.phone}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Quotation Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Date:</span> {new Date(quotation.quotation_date).toLocaleDateString()}</p>
                <p><span className="font-medium">Valid Until:</span> {new Date(quotation.valid_until).toLocaleDateString()}</p>
                <p><span className="font-medium">Created By:</span> {quotation.created_by?.name}</p>
                {quotation.sent_at && (
                  <p><span className="font-medium">Sent At:</span> {new Date(quotation.sent_at).toLocaleString()}</p>
                )}
                {quotation.approved_at && (
                  <p><span className="font-medium">Approved At:</span> {new Date(quotation.approved_at).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h3 className="font-semibold mb-2">Product Details</h3>
            <div className="bg-gray-50 p-4 rounded">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Product Name:</span> {quotation.product_name}</p>
                  <p><span className="font-medium">Product Type:</span> {quotation.product_type}</p>
                  <p><span className="font-medium">Quantity:</span> {quotation.quantity} {quotation.unit}</p>
                </div>
                <div>
                  {quotation.length && quotation.width && (
                    <p><span className="font-medium">Dimensions:</span> {quotation.length} × {quotation.width} {quotation.height ? `× ${quotation.height}` : ''} mm</p>
                  )}
                  {quotation.paper_type && (
                    <p><span className="font-medium">Paper Type:</span> {quotation.paper_type}</p>
                  )}
                  {quotation.gsm && (
                    <p><span className="font-medium">GSM:</span> {quotation.gsm}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="font-semibold mb-2">Specifications</h3>
            <div className="bg-gray-50 p-4 rounded">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Colors Front:</span> {quotation.color_front || 0}</p>
                  <p><span className="font-medium">Colors Back:</span> {quotation.color_back || 0}</p>
                  {quotation.pantone_p1 && (
                    <p><span className="font-medium">Pantone P1:</span> {quotation.pantone_p1_code}</p>
                  )}
                  {quotation.pantone_p2 && (
                    <p><span className="font-medium">Pantone P2:</span> {quotation.pantone_p2_code}</p>
                  )}
                </div>
                <div>
                  <p><span className="font-medium">Varnish:</span> {quotation.varnish_type}</p>
                  <p><span className="font-medium">Lamination:</span> {quotation.lamination_type}</p>
                  {quotation.embossing && <p>✓ Embossing</p>}
                  {quotation.foiling && <p>✓ Foiling</p>}
                  {quotation.die_cutting && <p>✓ Die Cutting</p>}
                  {quotation.pasting && <p>✓ Pasting</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div>
            <h3 className="font-semibold mb-2">Pricing Breakdown</h3>
            <div className="bg-gray-50 p-4 rounded">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Material Cost:</span>
                  <span>₹{quotation.material_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Printing Cost:</span>
                  <span>₹{quotation.printing_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Finishing Cost:</span>
                  <span>₹{quotation.finishing_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pre-Press Cost:</span>
                  <span>₹{quotation.pre_press_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overhead (15%):</span>
                  <span>₹{quotation.overhead_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Subtotal:</span>
                  <span>₹{quotation.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Margin ({quotation.profit_margin_percent}%):</span>
                  <span>₹{quotation.profit_margin_amount.toLocaleString()}</span>
                </div>
                {quotation.discount_percent > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount ({quotation.discount_percent}%):</span>
                    <span>-₹{quotation.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({quotation.tax_percent}%):</span>
                  <span>₹{quotation.tax_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Amount:</span>
                  <span>₹{quotation.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Items */}
          {quotation.items && quotation.items.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Additional Items</h3>
              <div className="bg-gray-50 p-4 rounded">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Description</th>
                      <th className="text-right py-2">Quantity</th>
                      <th className="text-right py-2">Unit Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.description}</td>
                        <td className="text-right">{item.quantity} {item.unit}</td>
                        <td className="text-right">₹{item.unit_price.toLocaleString()}</td>
                        <td className="text-right">₹{item.total_price?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {quotation.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <div className="bg-gray-50 p-4 rounded text-sm">
                {quotation.notes}
              </div>
            </div>
          )}

          {/* History */}
          {history && history.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">History</h3>
              <div className="bg-gray-50 p-4 rounded">
                <div className="space-y-2">
                  {history.map((entry: any, index: number) => (
                    <div key={index} className="text-sm border-l-2 border-blue-500 pl-3">
                      <p className="font-medium">
                        {entry.old_status} → {entry.new_status}
                      </p>
                      <p className="text-gray-600">
                        {entry.changed_by?.name} - {new Date(entry.changed_at).toLocaleString()}
                      </p>
                      {entry.notes && <p className="text-gray-700">{entry.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Converted Order Link */}
          {quotation.converted_to_order_id && (
            <div className="bg-purple-50 p-4 rounded border border-purple-200">
              <p className="text-sm">
                <span className="font-medium">Converted to Order:</span>{' '}
                <a
                  href={`/orders`}
                  className="text-blue-600 hover:underline"
                >
                  {quotation.converted_to_order?.order_number}
                </a>
                {' '}on {new Date(quotation.converted_at!).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Convert to Order Modal */}
        {showConvertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 p-6">
              <h3 className="text-xl font-bold mb-4">Convert to Order</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Date
                  </label>
                  <input
                    type="date"
                    value={convertData.order_date}
                    onChange={(e) => setConvertData({ ...convertData, order_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    value={convertData.delivery_date}
                    onChange={(e) => setConvertData({ ...convertData, delivery_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={convertData.notes}
                    onChange={(e) => setConvertData({ ...convertData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvert}
                  disabled={convertMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {convertMutation.isPending ? 'Converting...' : 'Convert to Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationDetails;
