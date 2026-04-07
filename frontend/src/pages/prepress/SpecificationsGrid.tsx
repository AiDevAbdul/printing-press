import { Edit2, Trash2 } from 'lucide-react';
import { ProductSpecification } from './specification-types';

interface SpecificationsGridProps {
  specifications: ProductSpecification[];
  onEdit: (spec: ProductSpecification) => void;
  onDelete: (specId: string) => void;
  getStatusColor: (status: string) => string;
}

export default function SpecificationsGrid({
  specifications,
  onEdit,
  onDelete,
  getStatusColor,
}: SpecificationsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {specifications.map((spec) => (
        <div
          key={spec.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">{spec.product_name}</h3>
              {spec.file_folder_name && (
                <p className="text-sm text-gray-600">{spec.file_folder_name}</p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(spec.status)}`}>
              {spec.status.replace('_', ' ')}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-4 text-sm">
            {spec.form_number && (
              <div>
                <p className="text-gray-600">Form Number</p>
                <p className="font-medium text-gray-900">{spec.form_number}</p>
              </div>
            )}
            {spec.customer_group && (
              <div>
                <p className="text-gray-600">Customer Group</p>
                <p className="font-medium text-gray-900 capitalize">{spec.customer_group}</p>
              </div>
            )}
            {spec.card_type && (
              <div>
                <p className="text-gray-600">Card Type</p>
                <p className="font-medium text-gray-900 capitalize">{spec.card_type}</p>
              </div>
            )}
            {spec.card_gramage && (
              <div>
                <p className="text-gray-600">Gramage</p>
                <p className="font-medium text-gray-900">{spec.card_gramage} gsm</p>
              </div>
            )}
          </div>

          {/* Specifications Summary */}
          <div className="bg-gray-50 rounded p-3 mb-4 text-xs space-y-1">
            {spec.lamination_type !== 'none' && (
              <p className="text-gray-700">
                <span className="font-semibold">Lamination:</span> {spec.lamination_type}
              </p>
            )}
            {spec.varnish_type !== 'none' && (
              <p className="text-gray-700">
                <span className="font-semibold">Varnish:</span> {spec.varnish_type}
              </p>
            )}
            {(spec.color_cyan || spec.color_magenta || spec.color_yellow || spec.color_black) && (
              <p className="text-gray-700">
                <span className="font-semibold">Colors:</span> CMYK
              </p>
            )}
            {spec.has_barcode && <p className="text-gray-700">✓ Barcode</p>}
            {spec.has_price && <p className="text-gray-700">✓ Price</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(spec)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onDelete(spec.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
