interface DurationDisplayProps {
  minutes: number;
  showIcon?: boolean;
  format?: 'short' | 'long';
  className?: string;
}

export function DurationDisplay({
  minutes,
  showIcon = false,
  format = 'short',
  className = '',
}: DurationDisplayProps) {
  const formatDuration = (mins: number): string => {
    if (mins < 60) {
      return format === 'short' ? `${mins}m` : `${mins} minutes`;
    }

    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;

    if (format === 'short') {
      return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
    }

    if (remainingMins > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMins} minute${remainingMins > 1 ? 's' : ''}`;
    }

    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {showIcon && <span className="text-gray-500">⏱</span>}
      <span>{formatDuration(minutes)}</span>
    </span>
  );
}
