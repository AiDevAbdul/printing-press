import { Edit2, Trash2 } from 'lucide-react';
import { ProductSpecification } from './specification-types';

interface SpecificationsListProps {
  specifications: ProductSpecification[];
  onEdit: (spec: ProductSpecification) => void;
  onDelete: (specId: string) => void;
  getStatusColor: (status: string) => string;
}

export default function SpecificationsList({
  specifications,
  onEdit,
  onDelete,
  getStatusColor,
}: SpecificationsListProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Product Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Form Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Customer Group
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Card Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {specifications.map((spec) => (
            <tr key={spec.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900">{spec.product_name}</p>
                  {spec.file_folder_name && (
                    <p className="text-sm text-gray-600">{spec.file_folder_name}</p>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {spec.form_number || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                {spec.customer_group || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                {spec.card_type || '-'}
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(spec.status)}`}>
                  {spec.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(spec)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(spec.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
