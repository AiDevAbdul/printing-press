import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { AlertCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onConfirm: () => Promise<void>;
}

export function DeleteUserDialog({ isOpen, onClose, user, onConfirm }: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete User">
      <div className="space-y-4">
        {error && <Alert variant="error" title="Error">{error}</Alert>}

        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
          <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Are you sure?</p>
            <p className="text-sm text-red-700 mt-1">
              This action will deactivate the user account. The user will no longer be able to access the system.
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">User to be deleted:</p>
          <div>
            <p className="font-medium text-gray-900">{user.full_name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete User'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
