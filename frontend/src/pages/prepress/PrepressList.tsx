import { Edit2, Trash2, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Design } from './types';

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  in_design: { label: 'In Design', icon: Clock, color: 'text-blue-600' },
  waiting_for_data: { label: 'Waiting for Data', icon: AlertCircle, color: 'text-yellow-600' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'text-green-600' },
  rejected: { label: 'Rejected', icon: AlertCircle, color: 'text-red-600' },
};

const categoryConfig: Record<string, string> = {
  commercial: 'Commercial',
  logo: 'Logo',
  product: 'Product',
  other: 'Other',
};

const typeConfig: Record<string, string> = {
  box: 'Box',
  label: 'Label',
  literature: 'Literature',
  logo: 'Logo',
  other: 'Other',
};

interface PrepressListProps {
  designs: Design[];
  onEdit: (design: Design) => void;
  onDelete: (designId: string) => void;
}

export default function PrepressList({ designs, onEdit, onDelete }: PrepressListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Design Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Designer
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Files
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {designs.map((design) => {
            const statusInfo = statusConfig[design.status];
            const StatusIcon = statusInfo.icon;

            return (
              <tr key={design.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{design.name}</p>
                    {design.notes && (
                      <p className="text-sm text-gray-600 line-clamp-1">{design.notes}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {design.product_name || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {categoryConfig[design.product_category]}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {typeConfig[design.design_type]}
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-2 text-sm font-medium ${statusInfo.color}`}>
                    <StatusIcon size={16} />
                    {statusInfo.label}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {design.designer?.name || '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    {design.attachments && design.attachments.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FileText size={16} />
                        {design.attachments.length}
                      </div>
                    )}
                    {design.approvals && design.approvals.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <CheckCircle size={16} />
                        {design.approvals.length}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(design)}
                      className="p-1 text-gray-600 hover:text-blue-600 transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(design.id)}
                      className="p-1 text-gray-600 hover:text-red-600 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
