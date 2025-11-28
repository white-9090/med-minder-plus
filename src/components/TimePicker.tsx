import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Clock, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface TimePickerProps {
  times: string[];
  onChange: (times: string[]) => void;
  label?: string;
  placeholder?: string;
  maxTimes?: number;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  times,
  onChange,
  label = "Times",
  placeholder = "Select times",
  maxTimes = 6,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTime, setNewTime] = useState('');

  const addTime = () => {
    if (newTime && !times.includes(newTime) && times.length < maxTimes) {
      const updatedTimes = [...times, newTime].sort();
      onChange(updatedTimes);
      setNewTime('');
    }
  };

  const removeTime = (timeToRemove: string) => {
    const updatedTimes = times.filter(time => time !== timeToRemove);
    onChange(updatedTimes);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const commonTimes = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <Clock className="mr-2 h-4 w-4" />
            {times.length > 0 
              ? `${times.length} time${times.length !== 1 ? 's' : ''} selected`
              : placeholder
            }
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            {/* Selected Times */}
            {times.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Selected Times</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                    >
                      {formatTime(time)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 text-blue-600 hover:text-blue-800"
                        onClick={() => removeTime(time)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Time */}
            <div>
              <Label className="text-sm font-medium">Add Time</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={addTime}
                  disabled={!newTime || times.includes(newTime) || times.length >= maxTimes}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Common Times */}
            <div>
              <Label className="text-sm font-medium">Common Times</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {commonTimes.map((time) => (
                  <Button
                    key={time}
                    variant={times.includes(time) ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      if (times.includes(time)) {
                        removeTime(time);
                      } else if (times.length < maxTimes) {
                        const updatedTimes = [...times, time].sort();
                        onChange(updatedTimes);
                      }
                    }}
                    disabled={!times.includes(time) && times.length >= maxTimes}
                  >
                    {formatTime(time)}
                  </Button>
                ))}
              </div>
            </div>

            {times.length >= maxTimes && (
              <p className="text-sm text-orange-600">
                Maximum {maxTimes} times allowed
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TimePicker;