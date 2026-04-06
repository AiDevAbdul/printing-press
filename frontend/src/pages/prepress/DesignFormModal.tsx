import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Design, User, Attachment } from './types';

interface DesignFormModalProps {
  design: Design | null;
  onClose: () => void;
  onSubmit: () => void;
}

export default function DesignFormModal({ design, onClose, onSubmit }: DesignFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    design_type: 'box',
    product_category: 'commercial',
    product_name: '',
    status: 'in_design',
    designer_id: '',
    specs_sheet_url: '',
    approval_sheet_url: '',
    notes: '',
  });

  const [users, setUsers] = useState<User[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newAttachment, setNewAttachment] = useState({ file_name: '', file_url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
    if (design) {
      setFormData({
        name: design.name,
        design_type: design.design_type,
        product_category: design.product_category,
        product_name: design.product_name || '',
        status: design.status,
        designer_id: design.designer_id || '',
        specs_sheet_url: design.specs_sheet_url || '',
        approval_sheet_url: design.approval_sheet_url || '',
        notes: design.notes || '',
      });
      setAttachments(design.attachments || []);
    }
  }, [design]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddAttachment = () => {
    if (newAttachment.file_name && newAttachment.file_url) {
      setAttachments((prev) => [...prev, { ...newAttachment, id: Date.now().toString() }]);
      setNewAttachment({ file_name: '', file_url: '' });
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (design) {
        // Update existing design
        await api.put(`/prepress/designs/${design.id}`, formData);
      } else {
        // Create new design
        const response = await api.post('/prepress/designs', formData);
        const designId = response.data.id;

        // Add attachments
        for (const attachment of attachments) {
          if (!attachment.id || attachment.id.toString().length > 20) {
            // Only add new attachments (not existing ones)
            await api.post('/prepress/attachments', {
              design_id: designId,
              file_name: attachment.file_name,
              file_url: attachment.file_url,
              file_type: attachment.file_type || '',
            });
          }
        }
      }

      onSubmit();
    } catch (err: unknown) {
      const error = err as any;
      setError(error.response?.data?.message || 'Failed to save design');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {design ? 'Edit Design' : 'New Design'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
              BASIC INFORMATION
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Design Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Septica Box Design"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="product_category"
                  value={formData.product_category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="commercial">Commercial</option>
                  <option value="logo">Logo</option>
                  <option value="product">Product</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Design Type *
                </label>
                <select
                  name="design_type"
                  value={formData.design_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="box">Box</option>
                  <option value="label">Label</option>
                  <option value="literature">Literature</option>
                  <option value="logo">Logo</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Mouthwash Box"
              />
            </div>
          </div>

          {/* Status & Assignment */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
              STATUS & ASSIGNMENT
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="in_design">In Design</option>
                  <option value="waiting_for_data">Waiting for Data</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designer
                </label>
                <select
                  name="designer_id"
                  value={formData.designer_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Designer</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
              DOCUMENTS
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specs Sheet URL
              </label>
              <input
                type="url"
                name="specs_sheet_url"
                value={formData.specs_sheet_url}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approval Sheet URL
              </label>
              <input
                type="url"
                name="approval_sheet_url"
                value={formData.approval_sheet_url}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
              ATTACHMENTS
            </h3>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{attachment.file_name}</p>
                      <p className="text-sm text-gray-600">{attachment.file_url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-red-600 hover:text-red-700 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <input
                type="text"
                value={newAttachment.file_name}
                onChange={(e) =>
                  setNewAttachment((prev) => ({
                    ...prev,
                    file_name: e.target.value,
                  }))
                }
                placeholder="File name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                value={newAttachment.file_url}
                onChange={(e) =>
                  setNewAttachment((prev) => ({
                    ...prev,
                    file_url: e.target.value,
                  }))
                }
                placeholder="File URL"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                <Plus size={18} />
                Add Attachment
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
              NOTES
            </h3>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any additional notes or instructions..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : design ? 'Update Design' : 'Create Design'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
