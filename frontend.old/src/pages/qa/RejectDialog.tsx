import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { XCircle } from 'lucide-react';

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

interface RejectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  approval: PendingApproval;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export function RejectDialog({
  isOpen,
  onClose,
  approval,
  onConfirm,
  isLoading,
}: RejectDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    onConfirm(reason);
    setReason('');
    setError(null);
  };

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reject Stage">
      <div className="space-y-4">
        <Alert variant="error" title="Reject Stage">
          The operator will be notified and must address the issues before resubmitting.
        </Alert>

        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
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
            Rejection Reason *
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="Explain why this stage is being rejected (e.g., quality issues, incorrect setup, etc.)"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            <XCircle className="w-4 h-4 mr-2" />
            {isLoading ? 'Rejecting...' : 'Reject Stage'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
