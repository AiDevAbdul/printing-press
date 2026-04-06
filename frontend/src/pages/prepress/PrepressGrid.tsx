import { Edit2, Trash2, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Design } from './types';

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  in_design: { label: 'In Design', icon: Clock, color: 'blue' },
  waiting_for_data: { label: 'Waiting for Data', icon: AlertCircle, color: 'yellow' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'green' },
  rejected: { label: 'Rejected', icon: AlertCircle, color: 'red' },
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

interface PrepressGridProps {
  designs: Design[];
  onEdit: (design: Design) => void;
  onDelete: (designId: string) => void;
}

export default function PrepressGrid({ designs, onEdit, onDelete }: PrepressGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {designs.map((design) => {
        const statusInfo = statusConfig[design.status];
        const StatusIcon = statusInfo.icon;
        const colorClasses: Record<string, string> = {
          blue: 'bg-blue-50 border-blue-200 text-blue-700',
          yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
          green: 'bg-green-50 border-green-200 text-green-700',
          red: 'bg-red-50 border-red-200 text-red-700',
        };

        return (
          <div
            key={design.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 flex-1">{design.name}</h3>
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
              </div>
              {design.product_name && (
                <p className="text-sm text-gray-600">{design.product_name}</p>
              )}
            </div>

            {/* Status Badge */}
            <div className={`px-4 py-3 border-b border-gray-200 ${colorClasses[statusInfo.color]}`}>
              <div className="flex items-center gap-2">
                <StatusIcon size={16} />
                <span className="text-sm font-medium">{statusInfo.label}</span>
              </div>
            </div>

            {/* Details */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Category</p>
                  <p className="text-sm font-medium text-gray-900">
                    {categoryConfig[design.product_category]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {typeConfig[design.design_type]}
                  </p>
                </div>
              </div>

              {design.designer && (
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Designer</p>
                  <p className="text-sm font-medium text-gray-900">{design.designer.name}</p>
                </div>
              )}

              {design.notes && (
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Notes</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{design.notes}</p>
                </div>
              )}

              {/* Attachments Count */}
              {design.attachments && design.attachments.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText size={16} />
                  <span>{design.attachments.length} attachment(s)</span>
                </div>
              )}

              {/* Approvals Count */}
              {design.approvals && design.approvals.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={16} />
                  <span>{design.approvals.length} approval(s)</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
              Created {new Date(design.created_at).toLocaleDateString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
