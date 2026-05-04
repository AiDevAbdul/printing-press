import { LucideIcon } from 'lucide-react';

export interface IconProps {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

export function Icon({
  icon: IconComponent,
  size = 'md',
  color,
  className = '',
}: IconProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  return (
    <IconComponent
      className={`${sizeClasses[size]} ${className}`}
      style={color ? { color } : undefined}
    />
  );
}
