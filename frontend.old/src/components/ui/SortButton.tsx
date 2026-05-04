import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { SortOrder } from '../../hooks/useSorting';

interface SortButtonProps {
  label: string;
  isActive: boolean;
  sortOrder?: SortOrder;
  onClick: () => void;
}

export const SortButton = ({ label, isActive, sortOrder, onClick }: SortButtonProps) => {
  return (
    <Button
      variant={isActive ? 'primary' : 'ghost'}
      size="sm"
      onClick={onClick}
      icon={
        isActive ? (
          sortOrder === 'desc' ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )
        ) : undefined
      }
    >
      {label}
    </Button>
  );
};
