import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import workflowService, { WorkflowStage } from '../../services/workflow.service';

interface QAApprovalModalProps {
  stage: WorkflowStage;
  approval: any;
  isOpen: boolean;
  onClose: () => void;
  onApprovalComplete: () => void;
  userRole?: string;
}

export const QAApprovalModal: React.FC<QAApprovalModalProps> = ({
  stage,
  approval,
  isOpen,
  onClose,
  onApprovalComplete,
  userRole,
}) => {
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isQAManager = userRole === 'qa_manager' || userRole === 'admin';

  const handleApprove = async () => {
    console.log('Approve clicked. Approval object:', approval);
    if (!approval?.id) {
      toast.error('Approval ID not found');
      console.error('Missing approval ID. Approval object:', approval);
      return;
    }

    setIsSubmitting(true);
    try {
      await workflowService.approveStage(approval.id, approveNotes);
      toast.success(`${stage.stage_name} approved by QA`);
      setShowApproveForm(false);
      setApproveNotes('');
      onClose();
      // Call onApprovalComplete after closing to refresh workflow
      setTimeout(() => onApprovalComplete(), 100);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!approval?.id) {
      toast.error('Approval ID not found');
      return;
    }

    if (!rejectReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await workflowService.rejectStage(approval.id, rejectReason, rejectNotes);
      toast.success(`${stage.stage_name} rejected by QA`);
      setShowRejectForm(false);
      setRejectReason('');
      setRejectNotes('');
      onClose();
      // Call onApprovalComplete after closing to refresh workflow
      setTimeout(() => onApprovalComplete(), 100);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isPending = stage.qa_approval_status === 'pending';
  const isApproved = stage.qa_approval_status === 'approved';
  const isRejected = stage.qa_approval_status === 'rejected';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className={`text-white p-6 rounded-t-xl ${
            isApproved ? 'bg-green-500' : isRejected ? 'bg-red-500' : 'bg-blue-500'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {isApproved ? (
                <CheckCircle className="w-6 h-6" />
              ) : isRejected ? (
                <XCircle className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
              <h3 className="text-lg font-bold">QA Approval</h3>
            </div>
            <p className="text-sm opacity-90">{stage.stage_name}</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Status Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold capitalize ${
                  isApproved ? 'text-green-600' : isRejected ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {stage.qa_approval_status?.replace('_', ' ')}
                </span>
              </div>

              {isApproved && stage.qa_approved_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Approved At:</span>
                  <span className="font-semibold">
                    {new Date(stage.qa_approved_at).toLocaleString()}
                  </span>
                </div>
              )}

              {isRejected && stage.qa_rejection_reason && (
                <div className="mt-3 pt-3 border-t border-red-300">
                  <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-600">{stage.qa_rejection_reason}</p>
                </div>
              )}
            </div>

            {/* Approval Forms - Only show if QA Manager and pending */}
            {isQAManager && isPending && (
              <>
                {!showApproveForm && !showRejectForm && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowApproveForm(true)}
                      disabled={isSubmitting}
                      className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      disabled={isSubmitting}
                      className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}

                {/* Approve Form */}
                {showApproveForm && (
                  <div className="space-y-3 border-t pt-4">
                    <textarea
                      placeholder="Approval notes (optional)"
                      value={approveNotes}
                      onChange={(e) => setApproveNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowApproveForm(false);
                          setApproveNotes('');
                        }}
                        className="flex-1 py-2 px-4 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApprove}
                        disabled={isSubmitting}
                        className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
                      >
                        {isSubmitting ? 'Approving...' : 'Confirm Approve'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Reject Form */}
                {showRejectForm && (
                  <div className="space-y-3 border-t pt-4">
                    <textarea
                      placeholder="Rejection reason *"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      rows={2}
                    />
                    <textarea
                      placeholder="Additional notes (optional)"
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectReason('');
                          setRejectNotes('');
                        }}
                        className="flex-1 py-2 px-4 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={isSubmitting || !rejectReason.trim()}
                        className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
                      >
                        {isSubmitting ? 'Rejecting...' : 'Confirm Reject'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Close Button */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={onClose}
              className="w-full py-2 px-4 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
