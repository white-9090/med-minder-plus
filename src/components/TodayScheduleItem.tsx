import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Check, Clock, SkipForward, Snooze, AlertCircle } from 'lucide-react';
import { TodayScheduleItem as TodayScheduleItemType, DoseStatus } from '../types';
import PillTag from './PillTag';
import { cn } from '../lib/utils';
import { format, isPast, parseISO } from 'date-fns';

interface TodayScheduleItemProps {
  item: TodayScheduleItemType;
  isElderlyMode?: boolean;
  onMarkAsTaken?: (id: string, notes?: string) => void;
  onMarkAsSkipped?: (id: string, notes?: string) => void;
  onSnooze?: (id: string, minutes: number) => void;
  className?: string;
}

const TodayScheduleItem: React.FC<TodayScheduleItemProps> = ({
  item,
  isElderlyMode = false,
  onMarkAsTaken,
  onMarkAsSkipped,
  onSnooze,
  className,
}) => {
  const [notes, setNotes] = useState('');
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'taken' | 'skipped'>('taken');

  const scheduledTime = parseISO(item.scheduledTime);
  const isOverdue = isPast(scheduledTime) && item.status === 'PENDING';
  const isPending = item.status === 'PENDING';
  const isTaken = item.status === 'TAKEN';
  const isSkipped = item.status === 'SKIPPED';
  const isMissed = item.status === 'MISSED';

  const getStatusColor = () => {
    switch (item.status) {
      case 'TAKEN':
        return 'bg-green-50 border-green-200';
      case 'SKIPPED':
        return 'bg-yellow-50 border-yellow-200';
      case 'MISSED':
        return 'bg-red-50 border-red-200';
      default:
        return isOverdue ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200';
    }
  };

  const getStatusBadge = () => {
    if (isTaken) {
      return <Badge className="bg-green-100 text-green-800">Taken</Badge>;
    }
    if (isSkipped) {
      return <Badge className="bg-yellow-100 text-yellow-800">Skipped</Badge>;
    }
    if (isMissed) {
      return <Badge variant="destructive">Missed</Badge>;
    }
    if (isOverdue) {
      return <Badge className="bg-orange-100 text-orange-800">Overdue</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const handleActionWithNotes = (type: 'taken' | 'skipped') => {
    setActionType(type);
    setIsNotesDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (actionType === 'taken' && onMarkAsTaken) {
      onMarkAsTaken(item.id, notes || undefined);
    } else if (actionType === 'skipped' && onMarkAsSkipped) {
      onMarkAsSkipped(item.id, notes || undefined);
    }
    
    setNotes('');
    setIsNotesDialogOpen(false);
  };

  const handleQuickAction = (type: 'taken' | 'skipped') => {
    if (type === 'taken' && onMarkAsTaken) {
      onMarkAsTaken(item.id);
    } else if (type === 'skipped' && onMarkAsSkipped) {
      onMarkAsSkipped(item.id);
    }
  };

  const handleSnooze = (minutes: number) => {
    if (onSnooze) {
      onSnooze(item.id, minutes);
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      getStatusColor(),
      className
    )}>
      <CardContent className={cn(
        "p-4",
        isElderlyMode && "p-6"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              {isOverdue && <AlertCircle className="h-5 w-5 text-orange-500" />}
              <Clock className={cn(
                "text-gray-400",
                isElderlyMode ? "h-6 w-6" : "h-5 w-5"
              )} />
              <span className={cn(
                "font-medium",
                isElderlyMode ? "text-lg" : "text-base",
                isOverdue ? "text-orange-700" : "text-gray-900"
              )}>
                {format(scheduledTime, 'h:mm a')}
              </span>
            </div>

            {/* Medicine Info */}
            <PillTag
              name={item.medicineName}
              strength={item.strength}
              form={item.form}
              colorTag={item.colorTag}
              size={isElderlyMode ? 'lg' : 'md'}
              showForm={false}
            />

            {/* Dosage */}
            <Badge variant="secondary" className={cn(
              isElderlyMode && "text-base px-3 py-1"
            )}>
              {item.dosageAmount} {item.dosageUnit}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status Badge */}
            {getStatusBadge()}

            {/* Action Buttons */}
            {isPending && (
              <div className="flex space-x-1">
                {/* Quick Take Button */}
                <Button
                  size={isElderlyMode ? "default" : "sm"}
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleQuickAction('taken')}
                >
                  <Check className={cn(
                    "mr-1",
                    isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                  )} />
                  {isElderlyMode ? 'Take' : 'Take'}
                </Button>

                {/* Take with Notes */}
                <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size={isElderlyMode ? "default" : "sm"}
                      onClick={() => handleActionWithNotes('taken')}
                    >
                      <Check className={cn(
                        "mr-1",
                        isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                      )} />
                      +Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {actionType === 'taken' ? 'Mark as Taken' : 'Mark as Skipped'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <PillTag
                          name={item.medicineName}
                          strength={item.strength}
                          form={item.form}
                          colorTag={item.colorTag}
                          size="lg"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Notes (optional)
                        </label>
                        <Textarea
                          placeholder="Any side effects, how you felt, etc..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsNotesDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleConfirmAction}>
                          Confirm
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Skip Button */}
                <Button
                  variant="outline"
                  size={isElderlyMode ? "default" : "sm"}
                  onClick={() => handleQuickAction('skipped')}
                >
                  <SkipForward className={cn(
                    "mr-1",
                    isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                  )} />
                  Skip
                </Button>

                {/* Snooze Button */}
                <Button
                  variant="ghost"
                  size={isElderlyMode ? "default" : "sm"}
                  onClick={() => handleSnooze(10)}
                >
                  <Snooze className={cn(
                    "mr-1",
                    isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                  )} />
                  10m
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Notes Display */}
        {item.notes && (
          <div className={cn(
            "mt-3 p-2 bg-gray-50 rounded text-gray-600",
            isElderlyMode ? "text-base" : "text-sm"
          )}>
            <strong>Note:</strong> {item.notes}
          </div>
        )}

        {/* Medicine Nickname */}
        {item.medicineNickname && (
          <div className={cn(
            "mt-2 text-gray-500",
            isElderlyMode ? "text-base" : "text-sm"
          )}>
            "{item.medicineNickname}"
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayScheduleItem;