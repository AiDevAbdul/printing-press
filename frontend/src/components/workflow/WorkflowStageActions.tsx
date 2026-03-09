import { useState } from 'react';
import toast from 'react-hot-toast';
import workflowService, { WorkflowStage } from '../../services/workflow.service';

interface WorkflowStageActionsProps {
  stage: WorkflowStage;
  jobId: string;
  operatorId?: string;
  operatorName?: string;
  machine?: string;
  onSuccess: () => void;
  touchOptimized?: boolean;
}

export function WorkflowStageActions({
  stage,
  jobId,
  operatorId,
  machine,
  onSuccess,
  touchOptimized = false,
}: WorkflowStageActionsProps) {
  const [showPauseInput, setShowPauseInput] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [wasteQuantity, setWasteQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttonHeight = touchOptimized ? 'h-[60px]' : 'h-10';
  const buttonText = touchOptimized ? 'text-base' : 'text-sm';

  const handleStart = async () => {
    if (!operatorId || !machine) {
      toast.error('Job must have an assigned operator and machine');
      return;
    }

    setIsSubmitting(true);
    try {
      await workflowService.startStage(jobId, stage.id, {
        operator_id: operatorId,
        machine: machine,
      });
      toast.success(`${stage.stage_name} started`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePause = async () => {
    setIsSubmitting(true);
    try {
      await workflowService.pauseStage(jobId, stage.id, {
        reason: pauseReason,
      });
      toast.success(`${stage.stage_name} paused`);
      setShowPauseInput(false);
      setPauseReason('');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to pause stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResume = async () => {
    setIsSubmitting(true);
    try {
      await workflowService.resumeStage(jobId, stage.id);
      toast.success(`${stage.stage_name} resumed`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resume stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await workflowService.completeStage(jobId, stage.id, {
        waste_quantity: wasteQuantity ? Number(wasteQuantity) : undefined,
        notes,
      });
      toast.success(`${stage.stage_name} completed`);
      setShowCompleteForm(false);
      setWasteQuantity('');
      setNotes('');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pending stage - Start button
  if (stage.status === 'pending') {
    return (
      <button
        onClick={handleStart}
        disabled={!stage.can_start || !operatorId || !machine || isSubmitting}
        className={`
          w-full ${buttonHeight} px-4 rounded-lg font-medium transition ${buttonText}
          ${
            stage.can_start && operatorId && machine && !isSubmitting
              ? 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isSubmitting ? 'Starting...' : '▶ Start Stage'}
      </button>
    );
  }

  // In progress stage - Pause and Complete buttons
  if (stage.status === 'in_progress') {
    if (showPauseInput) {
      return (
        <div className="space-y-2">
          <textarea
            placeholder="Reason for pause (optional)"
            value={pauseReason}
            onChange={(e) => setPauseReason(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${touchOptimized ? 'min-h-[80px]' : 'min-h-[60px]'}`}
            rows={touchOptimized ? 3 : 2}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowPauseInput(false);
                setPauseReason('');
              }}
              disabled={isSubmitting}
              className={`flex-1 ${buttonHeight} px-4 rounded-lg font-medium bg-gray-300 text-gray-800 hover:bg-gray-400 transition ${buttonText}`}
            >
              Cancel
            </button>
            <button
              onClick={handlePause}
              disabled={isSubmitting}
              className={`flex-1 ${buttonHeight} px-4 rounded-lg font-medium bg-orange-500 text-white hover:bg-orange-600 transition ${buttonText}`}
            >
              {isSubmitting ? 'Pausing...' : 'Confirm Pause'}
            </button>
          </div>
        </div>
      );
    }

    if (showCompleteForm) {
      return (
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Waste Quantity (optional)"
            value={wasteQuantity}
            onChange={(e) => setWasteQuantity(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${touchOptimized ? 'h-12' : 'h-10'}`}
          />
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${touchOptimized ? 'min-h-[80px]' : 'min-h-[60px]'}`}
            rows={touchOptimized ? 3 : 2}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowCompleteForm(false);
                setWasteQuantity('');
                setNotes('');
              }}
              disabled={isSubmitting}
              className={`flex-1 ${buttonHeight} px-4 rounded-lg font-medium bg-gray-300 text-gray-800 hover:bg-gray-400 transition ${buttonText}`}
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className={`flex-1 ${buttonHeight} px-4 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition ${buttonText}`}
            >
              {isSubmitting ? 'Completing...' : 'Complete'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <button
          onClick={() => setShowPauseInput(true)}
          disabled={!stage.can_pause || isSubmitting}
          className={`
            flex-1 ${buttonHeight} px-4 rounded-lg font-medium transition ${buttonText}
            ${
              stage.can_pause && !isSubmitting
                ? 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          ⏸ Pause
        </button>
        <button
          onClick={() => setShowCompleteForm(true)}
          disabled={!stage.can_complete || isSubmitting}
          className={`
            flex-1 ${buttonHeight} px-4 rounded-lg font-medium transition ${buttonText}
            ${
              stage.can_complete && !isSubmitting
                ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          ✓ Complete
        </button>
      </div>
    );
  }

  // Paused stage - Resume button
  if (stage.status === 'paused') {
    return (
      <button
        onClick={handleResume}
        disabled={isSubmitting}
        className={`
          w-full ${buttonHeight} px-4 rounded-lg font-medium transition ${buttonText}
          bg-green-500 text-white hover:bg-green-600 active:bg-green-700
        `}
      >
        {isSubmitting ? 'Resuming...' : '▶ Resume'}
      </button>
    );
  }

  // Completed stage - No actions
  return null;
}
