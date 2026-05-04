import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { CheckCircle } from 'lucide-react';

interface PendingApproval {
  id: string;
  stage_id: string;
  job_id: string;
  job_number: string;
  stage_name: string;
  stage_order: number;
  operator_id: string;
  operator_name: string;
  machine: string;
  created_at: string;
  status: string;
}

interface ApproveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  approval: PendingApproval;
  onConfirm: () => void;
  isLoading: boolean;
}

export function ApproveDialog({
  isOpen,
  onClose,
  approval,
  onConfirm,
  isLoading,
}: ApproveDialogProps) {
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm();
    setNotes('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Stage">
      <div className="space-y-4">
        <Alert variant="success" title="Ready to Approve">
          This stage will be marked as approved and the operator will be notified.
        </Alert>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-3">Stage Details:</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Job Number:</span>
              <span className="font-medium text-gray-900">{approval.job_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Stage:</span>
              <span className="font-medium text-gray-900">
                {approval.stage_name} (#{approval.stage_order})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Operator:</span>
              <span className="font-medium text-gray-900">{approval.operator_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Machine:</span>
              <span className="font-medium text-gray-900">{approval.machine}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Approval Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this approval..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isLoading ? 'Approving...' : 'Approve Stage'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
