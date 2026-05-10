'use client';

import React from 'react';
import { User, Cpu, Clock, CheckCircle2, Circle, AlertCircle, PauseCircle, Play, Pause, Flag, Check } from 'lucide-react';
import { StatusPill, StatusPillStatus } from './StatusPill';
import { Button } from './Button';

export interface WorkflowStage {
  id: string;
  name: string;
  order: number;
  status: StatusPillStatus;
  operator?: string;
  machine?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  estimatedMinutes?: number | null;
}

export interface WorkflowTimelineProps {
  stages: WorkflowStage[];
  onStart?: (stageId: string) => void;
  onPause?: (stageId: string) => void;
  onComplete?: (stageId: string) => void;
  onFlagIssue?: (stageId: string) => void;
  readOnly?: boolean;
  className?: string;
}

function formatDuration(startedAt: string, completedAt?: string | null): string {
  const end = completedAt ? new Date(completedAt) : new Date();
  const mins = Math.floor((end.getTime() - new Date(startedAt).getTime()) / 60_000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const statusIcon: Record<string, React.ReactNode> = {
  completed:   <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-success)' }} />,
  running:     <Play className="w-5 h-5" style={{ color: 'var(--color-info)' }} />,
  in_progress: <Play className="w-5 h-5" style={{ color: 'var(--color-info)' }} />,
  paused:      <PauseCircle className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />,
  blocked:     <AlertCircle className="w-5 h-5" style={{ color: 'var(--color-danger)' }} />,
  queued:      <Circle className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />,
  pending:     <Circle className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} />,
};

function StageNode({
  stage,
  isFirst,
  isLast,
  onStart,
  onPause,
  onComplete,
  onFlagIssue,
  readOnly,
}: {
  stage: WorkflowStage;
  isFirst: boolean;
  isLast: boolean;
  onStart?: (id: string) => void;
  onPause?: (id: string) => void;
  onComplete?: (id: string) => void;
  onFlagIssue?: (id: string) => void;
  readOnly: boolean;
}) {
  const isActive = stage.status === 'running' || stage.status === 'in_progress';
  const isCompleted = stage.status === 'completed';
  const isPaused = stage.status === 'paused';
  const isBlocked = stage.status === 'blocked';
  const showActions = !readOnly && (isActive || isPaused || isBlocked);

  const nodeRing = isActive
    ? 'ring-2 ring-[var(--color-info)] ring-offset-2'
    : isBlocked
    ? 'ring-2 ring-[var(--color-danger)] ring-offset-2'
    : '';

  return (
    <div className="flex flex-col items-center min-w-0">
      {/* Connector row */}
      <div className="flex items-center w-full">
        {/* Left connector */}
        <div
          className={`flex-1 h-0.5 ${isFirst ? 'invisible' : ''}`}
          style={{ backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-border)' }}
        />

        {/* Circle node */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${nodeRing} transition-all`}
          style={{
            backgroundColor: isActive
              ? 'var(--color-info-bg)'
              : isCompleted
              ? 'var(--color-success-bg)'
              : isBlocked
              ? 'var(--color-danger-bg)'
              : isPaused
              ? 'var(--color-warning-bg)'
              : 'var(--color-border-subtle)',
          }}
        >
          {statusIcon[stage.status] ?? statusIcon.queued}
        </div>

        {/* Right connector */}
        <div
          className={`flex-1 h-0.5 ${isLast ? 'invisible' : ''}`}
          style={{ backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-border)' }}
        />
      </div>

      {/* Stage card */}
      <div
        className={[
          'mt-3 w-44 rounded-xl p-3 border transition-all',
          isActive
            ? 'border-[var(--color-info)] bg-[var(--color-info-bg)]/40'
            : isBlocked
            ? 'border-[var(--color-danger)] bg-[var(--color-danger-bg)]/40'
            : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)]',
        ].join(' ')}
        style={{ boxShadow: isActive ? 'var(--shadow-2)' : 'var(--shadow-1)' }}
      >
        <div className="flex items-start justify-between gap-1 mb-2">
          <p className="text-xs font-semibold text-[var(--color-text-primary)] leading-snug flex-1 min-w-0">
            {stage.name}
          </p>
          <span className="text-[10px] font-medium text-[var(--color-text-tertiary)] flex-shrink-0">
            #{stage.order}
          </span>
        </div>

        <StatusPill status={stage.status} className="mb-2" />

        {stage.operator && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <User className="w-3 h-3 text-[var(--color-text-tertiary)] flex-shrink-0" />
            <span className="text-xs text-[var(--color-text-secondary)] truncate">{stage.operator}</span>
          </div>
        )}

        {stage.machine && (
          <div className="flex items-center gap-1.5 mt-1">
            <Cpu className="w-3 h-3 text-[var(--color-text-tertiary)] flex-shrink-0" />
            <span className="text-xs text-[var(--color-text-secondary)] truncate">{stage.machine}</span>
          </div>
        )}

        {stage.startedAt && (
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className="w-3 h-3 text-[var(--color-text-tertiary)] flex-shrink-0" />
            <span className="text-xs text-[var(--color-text-secondary)]">
              {isCompleted && stage.completedAt
                ? formatDuration(stage.startedAt, stage.completedAt)
                : isActive
                ? `${formatTime(stage.startedAt)} · ${formatDuration(stage.startedAt)}`
                : formatTime(stage.startedAt)}
            </span>
          </div>
        )}

        {stage.estimatedMinutes && !stage.startedAt && (
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className="w-3 h-3 text-[var(--color-text-tertiary)] flex-shrink-0" />
            <span className="text-xs text-[var(--color-text-tertiary)]">
              Est. {stage.estimatedMinutes}m
            </span>
          </div>
        )}

        {/* Actions on active stage */}
        {showActions && (
          <div className="mt-3 pt-2 border-t border-[var(--color-border-subtle)] flex flex-wrap gap-1">
            {(isActive) && onPause && (
              <button
                onClick={() => onPause(stage.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-[var(--color-warning-bg)] text-[var(--color-warning)] hover:opacity-80 transition-opacity"
              >
                <Pause className="w-3 h-3" />
                Pause
              </button>
            )}
            {(isPaused || isBlocked) && onStart && (
              <button
                onClick={() => onStart(stage.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-[var(--color-info-bg)] text-[var(--color-info)] hover:opacity-80 transition-opacity"
              >
                <Play className="w-3 h-3" />
                Resume
              </button>
            )}
            {isActive && onComplete && (
              <button
                onClick={() => onComplete(stage.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-[var(--color-success-bg)] text-[var(--color-success)] hover:opacity-80 transition-opacity"
              >
                <Check className="w-3 h-3" />
                Done
              </button>
            )}
            {!isBlocked && onFlagIssue && (
              <button
                onClick={() => onFlagIssue(stage.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-[var(--color-danger-bg)] text-[var(--color-danger)] hover:opacity-80 transition-opacity"
              >
                <Flag className="w-3 h-3" />
                Flag
              </button>
            )}
          </div>
        )}

        {/* Start button for queued stage when previous is done */}
        {!readOnly && stage.status === 'queued' && onStart && (
          <div className="mt-2">
            <button
              onClick={() => onStart(stage.id)}
              className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-[var(--color-brand-light)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white transition-colors"
            >
              <Play className="w-3 h-3" />
              Start
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function WorkflowTimeline({
  stages,
  onStart,
  onPause,
  onComplete,
  onFlagIssue,
  readOnly = false,
  className = '',
}: WorkflowTimelineProps) {
  const sorted = [...stages].sort((a, b) => a.order - b.order);

  return (
    <div className={`overflow-x-auto pb-2 ${className}`}>
      <div className="flex items-start gap-0 min-w-max px-4">
        {sorted.map((stage, i) => (
          <StageNode
            key={stage.id}
            stage={stage}
            isFirst={i === 0}
            isLast={i === sorted.length - 1}
            onStart={onStart}
            onPause={onPause}
            onComplete={onComplete}
            onFlagIssue={onFlagIssue}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}
