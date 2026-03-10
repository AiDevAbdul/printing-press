import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Printer, Palette, Zap, Layers, Scissors, Stamp, Package,
  Play, Pause, CheckCircle, Lock, ChevronRight, Clock, AlertCircle
} from 'lucide-react';
import workflowService, { WorkflowStage, WorkflowResponse } from '../services/workflow.service';

interface ProductionWorkflowLevelsProps {
  jobId: string;
  operatorName?: string;
  machine?: string;
  operatorId?: string;
}

const stageIcons: { [key: string]: React.ReactNode } = {
  'Printing - Cyan': <Printer className="w-6 h-6" />,
  'Printing - Magenta': <Palette className="w-6 h-6" />,
  'Printing - Yellow': <Palette className="w-6 h-6" />,
  'Printing - Black': <Printer className="w-6 h-6" />,
  'Printing - Pantone': <Palette className="w-6 h-6" />,
  'UV/Varnish': <Zap className="w-6 h-6" />,
  'Lamination': <Layers className="w-6 h-6" />,
  'Emboss': <Stamp className="w-6 h-6" />,
  'Sorting': <Scissors className="w-6 h-6" />,
  'Dye Cutting': <Scissors className="w-6 h-6" />,
  'Breaking': <Package className="w-6 h-6" />,
};

const stageColors: { [key: string]: string } = {
  pending: 'bg-gray-100 border-gray-300 text-gray-600',
  in_progress: 'bg-green-100 border-green-400 text-green-700 shadow-lg shadow-green-200',
  paused: 'bg-orange-100 border-orange-400 text-orange-700 shadow-lg shadow-orange-200',
  completed: 'bg-blue-100 border-blue-400 text-blue-700',
};

const statusBadgeColors: { [key: string]: string } = {
  pending: 'bg-gray-400',
  in_progress: 'bg-green-500 animate-pulse',
  paused: 'bg-orange-500',
  completed: 'bg-blue-500',
};

interface StageActionMenuProps {
  stage: WorkflowStage;
  jobId: string;
  operatorId?: string;
  machine?: string;
  onActionComplete: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const StageActionMenu: React.FC<StageActionMenuProps> = ({
  stage,
  jobId,
  operatorId,
  machine,
  onActionComplete,
  isOpen,
  onClose,
}) => {
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [wasteQuantity, setWasteQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (!operatorId || !machine) {
      toast.error('Operator and machine must be assigned');
      return;
    }

    setIsLoading(true);
    try {
      await workflowService.startStage(jobId, stage.id, {
        operator_id: operatorId,
        machine,
      });
      toast.success(`${stage.stage_name} started`);
      onActionComplete();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start stage');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    setIsLoading(true);
    try {
      await workflowService.pauseStage(jobId, stage.id, { reason: pauseReason });
      toast.success(`${stage.stage_name} paused`);
      setShowPauseDialog(false);
      setPauseReason('');
      onActionComplete();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to pause stage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async () => {
    setIsLoading(true);
    try {
      await workflowService.resumeStage(jobId, stage.id);
      toast.success(`${stage.stage_name} resumed`);
      onActionComplete();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resume stage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await workflowService.completeStage(jobId, stage.id, {
        waste_quantity: wasteQuantity ? Number(wasteQuantity) : undefined,
        notes,
      });
      toast.success(`${stage.stage_name} completed`);
      setShowCompleteDialog(false);
      setWasteQuantity('');
      setNotes('');
      onActionComplete();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete stage');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">{stageIcons[stage.stage_name] || <Package className="w-6 h-6" />}</div>
              <h3 className="text-xl font-bold">{stage.stage_name}</h3>
            </div>
            <p className="text-sm opacity-90">Stage {stage.stage_order}</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Stage Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold capitalize">{stage.status.replace('_', ' ')}</span>
              </div>
              {stage.operator_name && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Operator:</span>
                  <span className="font-semibold">{stage.operator_name}</span>
                </div>
              )}
              {stage.machine && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Machine:</span>
                  <span className="font-semibold">{stage.machine}</span>
                </div>
              )}
              {stage.active_duration_minutes > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">{Math.floor(stage.active_duration_minutes / 60)}h {stage.active_duration_minutes % 60}m</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {stage.status === 'pending' && (
                <button
                  onClick={handleStart}
                  disabled={isLoading || !operatorId || !machine}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Start Stage
                </button>
              )}

              {stage.status === 'in_progress' && (
                <>
                  <button
                    onClick={() => setShowPauseDialog(true)}
                    disabled={isLoading || !stage.can_pause}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
                  >
                    <Pause className="w-5 h-5" />
                    Pause Stage
                  </button>
                  <button
                    onClick={() => setShowCompleteDialog(true)}
                    disabled={isLoading || !stage.can_complete}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Complete Stage
                  </button>
                </>
              )}

              {stage.status === 'paused' && (
                <button
                  onClick={handleResume}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Resume Stage
                </button>
              )}

              {stage.status === 'completed' && (
                <div className="text-center py-3 text-green-600 font-semibold">
                  ✓ Stage Completed
                </div>
              )}
            </div>
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

      {/* Pause Dialog */}
      {showPauseDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-orange-500 text-white p-6 rounded-t-xl">
              <h3 className="text-lg font-bold">Pause Stage</h3>
            </div>
            <div className="p-6 space-y-4">
              <textarea
                placeholder="Reason for pause (optional)"
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPauseDialog(false)}
                  className="flex-1 py-2 px-4 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePause}
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
                >
                  {isLoading ? 'Pausing...' : 'Pause'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Dialog */}
      {showCompleteDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-blue-500 text-white p-6 rounded-t-xl">
              <h3 className="text-lg font-bold">Complete Stage</h3>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="number"
                placeholder="Waste Quantity (optional)"
                value={wasteQuantity}
                onChange={(e) => setWasteQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <textarea
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCompleteDialog(false)}
                  className="flex-1 py-2 px-4 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
                >
                  {isLoading ? 'Completing...' : 'Complete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const ProductionWorkflowLevels: React.FC<ProductionWorkflowLevelsProps> = ({
  jobId,
  operatorName,
  machine: jobMachine,
  operatorId: jobOperatorId,
}) => {
  const [workflow, setWorkflow] = useState<WorkflowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);

  useEffect(() => {
    fetchWorkflow();
    const interval = setInterval(fetchWorkflow, 5000);
    return () => clearInterval(interval);
  }, [jobId]);

  const fetchWorkflow = async () => {
    try {
      const data = await workflowService.getWorkflowStages(jobId);
      setWorkflow(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch workflow:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-2" />
          <p>Failed to load workflow</p>
        </div>
      </div>
    );
  }

  const completedCount = workflow.stages.filter(s => s.status === 'completed').length;
  const totalStages = workflow.stages.length;
  const progressPercent = (completedCount / totalStages) * 100;
  const selectedStage = workflow.stages.find(s => s.id === selectedStageId);

  return (
    <div className="space-y-8">
      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Production Workflow</h2>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span className="font-bold">{completedCount} / {totalStages} stages</span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Job Info */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-xs opacity-90 mb-1">Operator</div>
            <div className="font-semibold truncate">{operatorName || 'Not assigned'}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-xs opacity-90 mb-1">Machine</div>
            <div className="font-semibold truncate">{jobMachine || 'Not assigned'}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-xs opacity-90 mb-1">Current Stage</div>
            <div className="font-semibold truncate">{workflow.current_stage || 'Not started'}</div>
          </div>
        </div>
      </div>

      {/* Game-Level Stages */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Stages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflow.stages.map((stage, index) => {
            const isCompleted = stage.status === 'completed';
            const isActive = stage.status === 'in_progress';
            const isPaused = stage.status === 'paused';
            const isPending = stage.status === 'pending';
            const isLocked = isPending && index > 0 && !workflow.stages[index - 1]?.status.includes('completed');

            return (
              <div
                key={stage.id}
                className={`relative rounded-xl border-2 p-6 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  stageColors[stage.status]
                } ${isActive ? 'ring-2 ring-offset-2 ring-green-400 shadow-lg' : ''} ${
                  isPaused ? 'ring-2 ring-offset-2 ring-orange-400 shadow-lg' : ''
                }`}
                onClick={() => {
                  if (!isLocked) {
                    setSelectedStageId(stage.id);
                    setShowActionMenu(true);
                  }
                }}
              >
                {/* Lock Icon for Locked Stages */}
                {isLocked && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                )}

                {/* Stage Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">
                    {isCompleted ? (
                      <CheckCircle className="w-10 h-10 text-blue-600" />
                    ) : isActive ? (
                      <Play className="w-10 h-10 text-green-600 animate-pulse" />
                    ) : isPaused ? (
                      <Pause className="w-10 h-10 text-orange-600" />
                    ) : (
                      stageIcons[stage.stage_name] || <Package className="w-10 h-10" />
                    )}
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${statusBadgeColors[stage.status]}`}>
                    {isCompleted ? '✓' : stage.stage_order}
                  </div>
                </div>

                {/* Stage Name */}
                <h4 className="font-bold text-lg mb-2">{stage.stage_name}</h4>

                {/* Stage Details */}
                <div className="space-y-1 text-sm mb-4">
                  {stage.operator_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">👤</span>
                      <span>{stage.operator_name}</span>
                    </div>
                  )}
                  {stage.machine && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">🔧</span>
                      <span>{stage.machine}</span>
                    </div>
                  )}
                  {stage.active_duration_minutes > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span>{Math.floor(stage.active_duration_minutes / 60)}h {stage.active_duration_minutes % 60}m</span>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide capitalize">
                    {stage.status.replace('_', ' ')}
                  </span>
                  {!isLocked && !isCompleted && (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </div>

                {/* Pause Reason */}
                {isPaused && stage.pause_reason && (
                  <div className="mt-3 pt-3 border-t border-orange-300 text-xs text-orange-700 italic">
                    {stage.pause_reason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Menu */}
      {selectedStage && (
        <StageActionMenu
          stage={selectedStage}
          jobId={jobId}
          operatorId={jobOperatorId}
          machine={jobMachine}
          onActionComplete={fetchWorkflow}
          isOpen={showActionMenu}
          onClose={() => {
            setShowActionMenu(false);
            setSelectedStageId(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductionWorkflowLevels;
