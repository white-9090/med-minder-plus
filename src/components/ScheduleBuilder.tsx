import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { FrequencyType, ScheduleFormData } from '../types';
import TimePicker from './TimePicker';
import { cn } from '../lib/utils';

interface ScheduleBuilderProps {
  initialData?: Partial<ScheduleFormData>;
  onSave: (scheduleData: ScheduleFormData) => void;
  onCancel: () => void;
  isElderlyMode?: boolean;
}

const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({
  initialData,
  onSave,
  onCancel,
  isElderlyMode = false,
}) => {
  const [formData, setFormData] = useState<ScheduleFormData>({
    frequencyType: 'DAILY',
    timesOfDay: [],
    daysOfWeek: [],
    intervalDays: 1,
    intervalHours: 8,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: undefined,
    dosageAmount: 1,
    dosageUnit: 'tablet',
    ...initialData,
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const frequencyOptions = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKDAYS', label: 'Specific weekdays' },
    { value: 'CUSTOM_DAYS', label: 'Custom days' },
    { value: 'EVERY_X_DAYS', label: 'Every X days' },
    { value: 'EVERY_X_HOURS', label: 'Every X hours' },
  ];

  const dosageUnits = [
    'tablet', 'tablets', 'capsule', 'capsules', 'ml', 'mg', 'drops', 'puff', 'puffs'
  ];

  const weekdays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  const handleFrequencyChange = (frequency: FrequencyType) => {
    setFormData(prev => ({
      ...prev,
      frequencyType: frequency,
      // Reset relevant fields when frequency changes
      timesOfDay: frequency === 'EVERY_X_HOURS' ? [] : prev.timesOfDay,
      daysOfWeek: ['WEEKDAYS', 'CUSTOM_DAYS'].includes(frequency) ? prev.daysOfWeek : [],
    }));
  };

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek?.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...(prev.daysOfWeek || []), day],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.frequencyType !== 'EVERY_X_HOURS' && formData.timesOfDay.length === 0) {
      alert('Please select at least one time of day');
      return;
    }
    
    if (['WEEKDAYS', 'CUSTOM_DAYS'].includes(formData.frequencyType) && 
        (!formData.daysOfWeek || formData.daysOfWeek.length === 0)) {
      alert('Please select at least one day of the week');
      return;
    }

    onSave(formData);
  };

  const isTimesRequired = formData.frequencyType !== 'EVERY_X_HOURS';
  const isDaysRequired = ['WEEKDAYS', 'CUSTOM_DAYS'].includes(formData.frequencyType);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className={cn(
          isElderlyMode ? "text-2xl" : "text-xl"
        )}>
          Schedule Builder
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Frequency Type */}
          <div>
            <Label className={cn(
              "text-base font-medium",
              isElderlyMode && "text-lg"
            )}>
              Frequency
            </Label>
            <Select
              value={formData.frequencyType}
              onValueChange={handleFrequencyChange}
            >
              <SelectTrigger className={cn(
                "mt-1",
                isElderlyMode && "h-12 text-lg"
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interval Days (for EVERY_X_DAYS) */}
          {formData.frequencyType === 'EVERY_X_DAYS' && (
            <div>
              <Label className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Every how many days?
              </Label>
              <Input
                type="number"
                min="1"
                max="30"
                value={formData.intervalDays}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  intervalDays: parseInt(e.target.value) || 1
                }))}
                className={cn(
                  "mt-1",
                  isElderlyMode && "h-12 text-lg"
                )}
              />
            </div>
          )}

          {/* Interval Hours (for EVERY_X_HOURS) */}
          {formData.frequencyType === 'EVERY_X_HOURS' && (
            <div>
              <Label className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Every how many hours?
              </Label>
              <Input
                type="number"
                min="1"
                max="24"
                value={formData.intervalHours}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  intervalHours: parseInt(e.target.value) || 8
                }))}
                className={cn(
                  "mt-1",
                  isElderlyMode && "h-12 text-lg"
                )}
              />
            </div>
          )}

          {/* Days of Week (for WEEKDAYS and CUSTOM_DAYS) */}
          {isDaysRequired && (
            <div>
              <Label className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Days of the week
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {weekdays.map(day => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={formData.daysOfWeek?.includes(day.value) || false}
                      onCheckedChange={() => handleDayToggle(day.value)}
                    />
                    <Label 
                      htmlFor={`day-${day.value}`}
                      className={cn(
                        "text-sm",
                        isElderlyMode && "text-base"
                      )}
                    >
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Times of Day */}
          {isTimesRequired && (
            <TimePicker
              times={formData.timesOfDay}
              onChange={(times) => setFormData(prev => ({ ...prev, timesOfDay: times }))}
              label="Times of day"
              placeholder="Select times to take medicine"
            />
          )}

          {/* Dosage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Dosage Amount
              </Label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.dosageAmount}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dosageAmount: parseFloat(e.target.value) || 1
                }))}
                className={cn(
                  "mt-1",
                  isElderlyMode && "h-12 text-lg"
                )}
              />
            </div>
            
            <div>
              <Label className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Unit
              </Label>
              <Select
                value={formData.dosageUnit}
                onValueChange={(value) => setFormData(prev => ({ ...prev, dosageUnit: value }))}
              >
                <SelectTrigger className={cn(
                  "mt-1",
                  isElderlyMode && "h-12 text-lg"
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dosageUnits.map(unit => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <Label className={cn(
              "text-base font-medium",
              isElderlyMode && "text-lg"
            )}>
              Start Date
            </Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    isElderlyMode && "h-12 text-lg"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? format(new Date(formData.startDate), 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.startDate ? new Date(formData.startDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setFormData(prev => ({ ...prev, startDate: format(date, 'yyyy-MM-dd') }));
                      setStartDateOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date (Optional) */}
          <div>
            <Label className={cn(
              "text-base font-medium",
              isElderlyMode && "text-lg"
            )}>
              End Date (Optional)
            </Label>
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    isElderlyMode && "h-12 text-lg"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate ? format(new Date(formData.endDate), 'PPP') : 'No end date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.endDate ? new Date(formData.endDate) : undefined}
                  onSelect={(date) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      endDate: date ? format(date, 'yyyy-MM-dd') : undefined 
                    }));
                    setEndDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {formData.endDate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, endDate: undefined }))}
                className="mt-1"
              >
                Clear end date
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className={cn(
                isElderlyMode && "h-12 text-lg px-6"
              )}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(
                isElderlyMode && "h-12 text-lg px-6"
              )}
            >
              Save Schedule
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ScheduleBuilder;