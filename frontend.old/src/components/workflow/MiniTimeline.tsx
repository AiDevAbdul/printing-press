import { WorkflowStage } from '../../services/workflow.service';

interface MiniTimelineProps {
  stages: WorkflowStage[];
  compact?: boolean;
  showLabels?: boolean;
  onClick?: () => void;
}

const stageAbbreviations = [
  'C',  // Cyan
  'M',  // Magenta
  'Y',  // Yellow
  'K',  // Black
  'P',  // Pantone
  'U',  // UV/Varnish
  'L',  // Lamination
  'S',  // Sorting
  'E',  // Emboss
  'D',  // Dye Cutting
  'B',  // Breaking
  'P',  // Pasting
];

const statusConfig: Record<string, { icon: string; color: string; borderColor: string; pulse?: boolean }> = {
  pending: {
    icon: '·',
    color: 'bg-gray-300 text-gray-600',
    borderColor: 'border-gray-400',
  },
  in_progress: {
    icon: '⚡',
    color: 'bg-green-500 text-white',
    borderColor: 'border-green-600',
    pulse: true,
  },
  paused: {
    icon: '⏸',
    color: 'bg-orange-500 text-white',
    borderColor: 'border-orange-600',
  },
  completed: {
    icon: '✓',
    color: 'bg-blue-500 text-white',
    borderColor: 'border-blue-600',
  },
};

export function MiniTimeline({ stages, compact = true, showLabels = false, onClick }: MiniTimelineProps) {
  const completedCount = stages.filter(s => s.status === 'completed').length;
  const totalCount = stages.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const circleSize = compact ? 'w-6 h-6' : 'w-8 h-8';
  const fontSize = compact ? 'text-xs' : 'text-sm';

  return (
    <div
      className={`relative ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Progress bar background */}
      <div className="absolute inset-0 bg-gray-200 rounded-full h-2 top-1/2 -translate-y-1/2">
        <div
          className="bg-blue-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Stage indicators */}
      <div className="relative flex justify-between items-center gap-1">
        {stages.map((stage, index) => {
          const config = statusConfig[stage.status];
          const abbreviation = stageAbbreviations[index] || index + 1;

          return (
            <div
              key={stage.id}
              className="group relative"
              title={`${stage.stage_name} - ${stage.status.replace('_', ' ')}`}
            >
              <div
                className={`
                  ${circleSize} rounded-full border-2 flex items-center justify-center
                  ${config.color} ${config.borderColor} ${fontSize} font-bold
                  transition-all duration-300
                  ${config.pulse ? 'animate-pulse' : ''}
                  group-hover:scale-110
                `}
              >
                {config.icon}
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {stage.stage_name}
                  {stage.status === 'in_progress' && stage.active_duration_minutes > 0 && (
                    <span className="ml-1">({stage.active_duration_minutes}m)</span>
                  )}
                  {stage.status === 'completed' && stage.total_duration_minutes && (
                    <span className="ml-1">({stage.total_duration_minutes}m)</span>
                  )}
                </div>
                <div className="w-2 h-2 bg-gray-900 rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1" />
              </div>

              {/* Stage label below (optional) */}
              {showLabels && (
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs text-gray-600">
                  {abbreviation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress percentage text */}
      {!compact && (
        <div className="text-center mt-2 text-sm text-gray-600">
          {completedCount}/{totalCount} stages ({Math.round(progressPercentage)}%)
        </div>
      )}
    </div>
  );
}
