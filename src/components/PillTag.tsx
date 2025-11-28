import React from 'react';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import { MedicineForm } from '../types';

interface PillTagProps {
  name: string;
  strength?: string;
  form: MedicineForm;
  colorTag?: string;
  size?: 'sm' | 'md' | 'lg';
  showForm?: boolean;
  className?: string;
}

const formIcons: Record<MedicineForm, string> = {
  tablet: '💊',
  capsule: '💊',
  liquid: '🧴',
  injection: '💉',
  other: '🔹',
};

const PillTag: React.FC<PillTagProps> = ({
  name,
  strength,
  form,
  colorTag = '#3B82F6',
  size = 'md',
  showForm = true,
  className,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Pill Icon/Avatar */}
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold text-white shadow-sm",
          sizeClasses[size]
        )}
        style={{ backgroundColor: colorTag }}
      >
        {getInitials(name)}
      </div>

      {/* Medicine Info */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-1">
          <span className={cn("font-medium text-gray-900", textSizeClasses[size])}>
            {name}
          </span>
          {strength && (
            <Badge variant="secondary" className="text-xs">
              {strength}
            </Badge>
          )}
        </div>
        
        {showForm && (
          <div className="flex items-center space-x-1">
            <span className="text-sm">{formIcons[form]}</span>
            <span className={cn("text-gray-500 capitalize", textSizeClasses[size])}>
              {form}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PillTag;