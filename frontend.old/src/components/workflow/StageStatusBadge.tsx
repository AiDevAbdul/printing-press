interface StageStatusBadgeProps {
  status: 'pending' | 'in_progress' | 'paused' | 'completed';
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  pending: {
    icon: '·',
    label: 'Pending',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300',
  },
  in_progress: {
    icon: '⚡',
    label: 'In Progress',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
  },
  paused: {
    icon: '⏸',
    label: 'Paused',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
  },
  completed: {
    icon: '✓',
    label: 'Completed',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
  },
};

const sizeConfig = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    iconSize: 'text-sm',
  },
  md: {
    padding: 'px-3 py-1',
    text: 'text-sm',
    iconSize: 'text-base',
  },
  lg: {
    padding: 'px-4 py-2',
    text: 'text-base',
    iconSize: 'text-lg',
  },
};

export function StageStatusBadge({ status, size = 'md' }: StageStatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeStyles.padding} ${sizeStyles.text}
        font-medium
      `}
    >
      <span className={sizeStyles.iconSize}>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
