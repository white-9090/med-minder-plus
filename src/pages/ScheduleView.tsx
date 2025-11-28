import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useMedicineStore } from '../stores/medicineStore';
import { useSettingsStore } from '../stores/settingsStore';
import ScheduleBuilder from '../components/ScheduleBuilder';
import PillTag from '../components/PillTag';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const ScheduleView: React.FC = () => {
  const navigate = useNavigate();
  const { medicineId } = useParams();
  const { user } = useAuthStore();
  const { 
    medicines, 
    schedules, 
    fetchMedicines, 
    fetchSchedules, 
    addSchedule,
    updateSchedule,
    deleteSchedule
  } = useMedicineStore();
  const { settings } = useSettingsStore();

  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleBuilder, setShowScheduleBuilder] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isElderlyMode = settings?.elderlyMode || false;

  useEffect(() => {
    const loadData = async () => {
      if (!user || !medicineId) return;
      
      try {
        setIsLoading(true);
        await Promise.all([
          fetchMedicines(user.id),
          fetchSchedules(user.id),
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load medicine data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, medicineId, fetchMedicines, fetchSchedules]);

  const medicine = medicines.find(m => m.id === medicineId);
  const medicineSchedules = schedules.filter(s => s.medicineId === medicineId);

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setShowScheduleBuilder(true);
  };

  const handleEditSchedule = (scheduleId: string) => {
    setEditingSchedule(scheduleId);
    setShowScheduleBuilder(true);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteSchedule(scheduleId);
      } catch (error) {
        setError('Failed to delete schedule');
      }
    }
  };

  const handleSaveSchedule = async (scheduleData: any) => {
    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule, scheduleData);
      } else {
        await addSchedule(medicineId!, scheduleData);
      }
      setShowScheduleBuilder(false);
      setEditingSchedule(null);
    } catch (error) {
      setError('Failed to save schedule');
    }
  };

  const getScheduleDescription = (schedule: any) => {
    const { frequencyType, timesOfDay, daysOfWeek, intervalDays, intervalHours } = schedule;
    
    if (frequencyType === 'DAILY') {
      return `Daily at ${timesOfDay?.map((time: string) => format(new Date(`2000-01-01T${time}`), 'h:mm a')).join(', ')}`;
    } else if (frequencyType === 'WEEKDAYS') {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const selectedDays = daysOfWeek?.map((day: number) => dayNames[day]).join(', ');
      return `${selectedDays} at ${timesOfDay?.map((time: string) => format(new Date(`2000-01-01T${time}`), 'h:mm a')).join(', ')}`;
    } else if (frequencyType === 'EVERY_X_DAYS') {
      return `Every ${intervalDays} day${intervalDays !== 1 ? 's' : ''} at ${timesOfDay?.map((time: string) => format(new Date(`2000-01-01T${time}`), 'h:mm a')).join(', ')}`;
    } else if (frequencyType === 'EVERY_X_HOURS') {
      return `Every ${intervalHours} hour${intervalHours !== 1 ? 's' : ''}`;
    }
    
    return 'Custom schedule';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Medicine not found. Please check the URL or go back to your medicines list.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate('/medicines')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Medicines
          </Button>
        </div>
      </div>
    );
  }

  if (showScheduleBuilder) {
    const scheduleToEdit = editingSchedule 
      ? medicineSchedules.find(s => s.id === editingSchedule)
      : null;

    return (
      <div className="max-w-4xl mx-auto">
        <ScheduleBuilder
          initialData={scheduleToEdit ? {
            frequencyType: scheduleToEdit.frequencyType,
            timesOfDay: scheduleToEdit.timesOfDay || [],
            daysOfWeek: scheduleToEdit.daysOfWeek,
            intervalDays: scheduleToEdit.intervalDays,
            intervalHours: scheduleToEdit.intervalHours,
            startDate: scheduleToEdit.startDate,
            endDate: scheduleToEdit.endDate,
            dosageAmount: scheduleToEdit.dosageAmount,
            dosageUnit: scheduleToEdit.dosageUnit,
          } : undefined}
          onSave={handleSaveSchedule}
          onCancel={() => {
            setShowScheduleBuilder(false);
            setEditingSchedule(null);
          }}
          isElderlyMode={isElderlyMode}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/medicines')}
          className={cn(
            isElderlyMode && "h-12 text-lg px-4"
          )}
        >
          <ArrowLeft className={cn(
            "mr-2",
            isElderlyMode ? "h-6 w-6" : "h-4 w-4"
          )} />
          Back to Medicines
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Medicine Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={cn(
                "flex items-center space-x-3",
                isElderlyMode ? "text-2xl" : "text-xl"
              )}>
                <PillTag
                  name={medicine.name}
                  strength={medicine.strength}
                  form={medicine.form}
                  colorTag={medicine.colorTag}
                  size={isElderlyMode ? 'lg' : 'md'}
                />
              </CardTitle>
              {medicine.nickname && (
                <p className={cn(
                  "text-gray-600 mt-2",
                  isElderlyMode ? "text-lg" : "text-base"
                )}>
                  "{medicine.nickname}"
                </p>
              )}
            </div>
            
            <Button
              onClick={handleAddSchedule}
              className={cn(
                isElderlyMode && "h-12 text-lg px-6"
              )}
            >
              <Plus className={cn(
                "mr-2",
                isElderlyMode ? "h-6 w-6" : "h-4 w-4"
              )} />
              Add Schedule
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Schedules */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(
            "flex items-center",
            isElderlyMode ? "text-2xl" : "text-xl"
          )}>
            <Calendar className={cn(
              "mr-2",
              isElderlyMode ? "h-7 w-7" : "h-5 w-5"
            )} />
            Medication Schedules
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {medicineSchedules.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className={cn(
                "font-semibold text-gray-900 mb-2",
                isElderlyMode ? "text-2xl" : "text-xl"
              )}>
                No Schedules Set
              </h3>
              <p className={cn(
                "text-gray-600 mb-4",
                isElderlyMode ? "text-lg" : "text-base"
              )}>
                Create a schedule to set up reminders for this medicine
              </p>
              <Button onClick={handleAddSchedule}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {medicineSchedules.map((schedule) => (
                <Card key={schedule.id} className="border-l-4 border-l-blue-500">
                  <CardContent className={cn(
                    "p-4",
                    isElderlyMode && "p-6"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline" className={cn(
                            isElderlyMode && "text-base px-3 py-1"
                          )}>
                            {schedule.dosageAmount} {schedule.dosageUnit}
                          </Badge>
                          {schedule.endDate && (
                            <Badge variant="secondary" className={cn(
                              isElderlyMode && "text-base px-3 py-1"
                            )}>
                              Until {format(new Date(schedule.endDate), 'MMM d, yyyy')}
                            </Badge>
                          )}
                        </div>
                        
                        <p className={cn(
                          "text-gray-900 font-medium",
                          isElderlyMode ? "text-lg" : "text-base"
                        )}>
                          {getScheduleDescription(schedule)}
                        </p>
                        
                        <p className={cn(
                          "text-gray-600 mt-1",
                          isElderlyMode ? "text-base" : "text-sm"
                        )}>
                          Started {format(new Date(schedule.startDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size={isElderlyMode ? "default" : "sm"}
                          onClick={() => handleEditSchedule(schedule.id)}
                        >
                          <Edit className={cn(
                            isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                          )} />
                        </Button>
                        <Button
                          variant="ghost"
                          size={isElderlyMode ? "default" : "sm"}
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        >
                          <Trash2 className={cn(
                            "text-red-500",
                            isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                          )} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medicine Details */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(
            isElderlyMode ? "text-2xl" : "text-xl"
          )}>
            Medicine Details
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Current Stock
              </Label>
              <p className={cn(
                "text-gray-900",
                isElderlyMode ? "text-lg" : "text-base"
              )}>
                {medicine.stockCount} {medicine.form}s
              </p>
            </div>
            
            <div>
              <Label className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Refill Threshold
              </Label>
              <p className={cn(
                "text-gray-900",
                isElderlyMode ? "text-lg" : "text-base"
              )}>
                {medicine.refillThreshold} {medicine.form}s
              </p>
            </div>
          </div>
          
          {medicine.notes && (
            <div>
              <Label className={cn(
                "text-base font-medium",
                isElderlyMode && "text-lg"
              )}>
                Notes
              </Label>
              <p className={cn(
                "text-gray-900 mt-1",
                isElderlyMode ? "text-lg" : "text-base"
              )}>
                {medicine.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}

export default ScheduleView;