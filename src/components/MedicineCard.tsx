import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, Clock, Edit, Trash2 } from 'lucide-react';
import { Medicine, Schedule } from '../types';
import PillTag from './PillTag';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface MedicineCardProps {
  medicine: Medicine;
  schedules: Schedule[];
  nextDoseTime?: string;
  isElderlyMode?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddSchedule?: () => void;
  className?: string;
}

const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  schedules,
  nextDoseTime,
  isElderlyMode = false,
  onEdit,
  onDelete,
  onAddSchedule,
  className,
}) => {
  const isLowStock = medicine.stockCount <= medicine.refillThreshold;
  const hasSchedules = schedules.length > 0;

  const getScheduleSummary = () => {
    if (schedules.length === 0) return 'No schedule set';
    
    const schedule = schedules[0]; // Show first schedule for simplicity
    const timesCount = schedule.timesOfDay?.length || 0;
    
    if (schedule.frequencyType === 'DAILY') {
      return `${timesCount} time${timesCount !== 1 ? 's' : ''} daily`;
    } else if (schedule.frequencyType === 'WEEKDAYS') {
      return `${timesCount} time${timesCount !== 1 ? 's' : ''} on weekdays`;
    } else if (schedule.frequencyType === 'EVERY_X_DAYS' && schedule.intervalDays) {
      return `Every ${schedule.intervalDays} day${schedule.intervalDays !== 1 ? 's' : ''}`;
    } else if (schedule.frequencyType === 'EVERY_X_HOURS' && schedule.intervalHours) {
      return `Every ${schedule.intervalHours} hour${schedule.intervalHours !== 1 ? 's' : ''}`;
    }
    
    return 'Custom schedule';
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isLowStock && "border-orange-200 bg-orange-50",
      className
    )}>
      <CardHeader className={cn(
        "pb-3",
        isElderlyMode && "pb-4"
      )}>
        <div className="flex items-start justify-between">
          <PillTag
            name={medicine.name}
            strength={medicine.strength}
            form={medicine.form}
            colorTag={medicine.colorTag}
            size={isElderlyMode ? 'lg' : 'md'}
          />
          
          <div className="flex space-x-1">
            {onEdit && (
              <Button
                variant="ghost"
                size={isElderlyMode ? "default" : "sm"}
                onClick={onEdit}
              >
                <Edit className={cn(
                  "text-gray-500",
                  isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                )} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size={isElderlyMode ? "default" : "sm"}
                onClick={onDelete}
              >
                <Trash2 className={cn(
                  "text-red-500",
                  isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                )} />
              </Button>
            )}
          </div>
        </div>

        {medicine.nickname && (
          <p className={cn(
            "text-gray-600 mt-1",
            isElderlyMode ? "text-base" : "text-sm"
          )}>
            "{medicine.nickname}"
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Schedule Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className={cn(
              "text-gray-400",
              isElderlyMode ? "h-5 w-5" : "h-4 w-4"
            )} />
            <span className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              {getScheduleSummary()}
            </span>
          </div>
          
          {!hasSchedules && onAddSchedule && (
            <Button
              variant="outline"
              size={isElderlyMode ? "default" : "sm"}
              onClick={onAddSchedule}
            >
              Add Schedule
            </Button>
          )}
        </div>

        {/* Next Dose */}
        {nextDoseTime && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={cn(
              isElderlyMode && "text-base px-3 py-1"
            )}>
              Next: {format(new Date(nextDoseTime), 'h:mm a')}
            </Badge>
          </div>
        )}

        {/* Stock Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isLowStock && (
              <AlertTriangle className={cn(
                "text-orange-500",
                isElderlyMode ? "h-5 w-5" : "h-4 w-4"
              )} />
            )}
            <span className={cn(
              isLowStock ? "text-orange-700" : "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              {medicine.stockCount} left
            </span>
          </div>
          
          {isLowStock && (
            <Badge variant="destructive" className={cn(
              isElderlyMode && "text-base px-3 py-1"
            )}>
              Low Stock
            </Badge>
          )}
        </div>

        {/* Refill Threshold */}
        <div className={cn(
          "text-gray-500",
          isElderlyMode ? "text-sm" : "text-xs"
        )}>
          Refill when ≤ {medicine.refillThreshold}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineCard;