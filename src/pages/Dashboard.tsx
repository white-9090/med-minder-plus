import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Pill,
  Users,
  FileText,
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useDoseStore } from '../stores/doseStore';
import { useMedicineStore } from '../stores/medicineStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useSettingsStore } from '../stores/settingsStore';
import TodayScheduleItem from '../components/TodayScheduleItem';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    todaySchedule, 
    fetchTodaySchedule, 
    markDoseAsTaken, 
    markDoseAsSkipped,
    snoozeDose,
    getTodayAdherence,
    getOverdueDoses
  } = useDoseStore();
  const { medicines, getMedicinesNeedingRefill, fetchMedicines } = useMedicineStore();
  const { unreadCount } = useNotificationStore();
  const { settings } = useSettingsStore();

  const [isLoading, setIsLoading] = useState(true);

  const isElderlyMode = settings?.elderlyMode || false;
  const isPatient = user?.role === 'PATIENT';

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        if (isPatient) {
          await Promise.all([
            fetchTodaySchedule(user.id),
            fetchMedicines(user.id),
          ]);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, isPatient, fetchTodaySchedule, fetchMedicines]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const todayAdherence = getTodayAdherence();
  const overdueDoses = getOverdueDoses();
  const medicinesNeedingRefill = getMedicinesNeedingRefill();

  const handleDoseTaken = async (scheduleItemId: string, notes?: string) => {
    await markDoseAsTaken(scheduleItemId, notes);
  };

  const handleDoseSkipped = async (scheduleItemId: string, notes?: string) => {
    await markDoseAsSkipped(scheduleItemId, notes);
  };

  const handleSnooze = async (scheduleItemId: string, minutes: number) => {
    await snoozeDose(scheduleItemId, minutes);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Patient Dashboard
  if (isPatient) {
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className={cn(
              "font-bold text-gray-900",
              isElderlyMode ? "text-3xl" : "text-2xl"
            )}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.name}!
            </h1>
            <p className={cn(
              "text-gray-600 mt-1",
              isElderlyMode ? "text-lg" : "text-base"
            )}>
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button
              onClick={() => navigate('/medicines/new')}
              className={cn(
                isElderlyMode && "h-12 text-lg px-6"
              )}
            >
              <Plus className={cn(
                "mr-2",
                isElderlyMode ? "h-6 w-6" : "h-4 w-4"
              )} />
              Add Medicine
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/prescriptions/upload')}
              className={cn(
                isElderlyMode && "h-12 text-lg px-6"
              )}
            >
              <FileText className={cn(
                "mr-2",
                isElderlyMode ? "h-6 w-6" : "h-4 w-4"
              )} />
              Scan Prescription
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className={cn(
              "p-4",
              isElderlyMode && "p-6"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "text-gray-600",
                    isElderlyMode ? "text-base" : "text-sm"
                  )}>
                    Today's Adherence
                  </p>
                  <p className={cn(
                    "font-bold text-green-600",
                    isElderlyMode ? "text-3xl" : "text-2xl"
                  )}>
                    {todayAdherence.percentage.toFixed(0)}%
                  </p>
                </div>
                <CheckCircle className={cn(
                  "text-green-600",
                  isElderlyMode ? "h-8 w-8" : "h-6 w-6"
                )} />
              </div>
              <Progress 
                value={todayAdherence.percentage} 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className={cn(
              "p-4",
              isElderlyMode && "p-6"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "text-gray-600",
                    isElderlyMode ? "text-base" : "text-sm"
                  )}>
                    Overdue Doses
                  </p>
                  <p className={cn(
                    "font-bold",
                    overdueDoses.length > 0 ? "text-orange-600" : "text-gray-900",
                    isElderlyMode ? "text-3xl" : "text-2xl"
                  )}>
                    {overdueDoses.length}
                  </p>
                </div>
                <AlertTriangle className={cn(
                  overdueDoses.length > 0 ? "text-orange-600" : "text-gray-400",
                  isElderlyMode ? "h-8 w-8" : "h-6 w-6"
                )} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className={cn(
              "p-4",
              isElderlyMode && "p-6"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "text-gray-600",
                    isElderlyMode ? "text-base" : "text-sm"
                  )}>
                    Active Medicines
                  </p>
                  <p className={cn(
                    "font-bold text-blue-600",
                    isElderlyMode ? "text-3xl" : "text-2xl"
                  )}>
                    {medicines.length}
                  </p>
                </div>
                <Pill className={cn(
                  "text-blue-600",
                  isElderlyMode ? "h-8 w-8" : "h-6 w-6"
                )} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className={cn(
              "p-4",
              isElderlyMode && "p-6"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "text-gray-600",
                    isElderlyMode ? "text-base" : "text-sm"
                  )}>
                    Refill Alerts
                  </p>
                  <p className={cn(
                    "font-bold",
                    medicinesNeedingRefill.length > 0 ? "text-red-600" : "text-gray-900",
                    isElderlyMode ? "text-3xl" : "text-2xl"
                  )}>
                    {medicinesNeedingRefill.length}
                  </p>
                </div>
                <AlertTriangle className={cn(
                  medicinesNeedingRefill.length > 0 ? "text-red-600" : "text-gray-400",
                  isElderlyMode ? "h-8 w-8" : "h-6 w-6"
                )} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(overdueDoses.length > 0 || medicinesNeedingRefill.length > 0) && (
          <div className="space-y-3">
            {overdueDoses.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                    <span className={cn(
                      "font-medium text-orange-800",
                      isElderlyMode ? "text-lg" : "text-base"
                    )}>
                      You have {overdueDoses.length} overdue dose{overdueDoses.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {medicinesNeedingRefill.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      <span className={cn(
                        "font-medium text-red-800",
                        isElderlyMode ? "text-lg" : "text-base"
                      )}>
                        {medicinesNeedingRefill.length} medicine{medicinesNeedingRefill.length !== 1 ? 's' : ''} need refilling
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size={isElderlyMode ? "default" : "sm"}
                      onClick={() => navigate('/medicines')}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={cn(
                "flex items-center",
                isElderlyMode ? "text-2xl" : "text-xl"
              )}>
                <Clock className={cn(
                  "mr-2",
                  isElderlyMode ? "h-7 w-7" : "h-5 w-5"
                )} />
                Today's Medications
              </CardTitle>
              <Button
                variant="outline"
                size={isElderlyMode ? "default" : "sm"}
                onClick={() => navigate('/schedule')}
              >
                View Full Schedule
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className={cn(
                  "text-gray-600",
                  isElderlyMode ? "text-lg" : "text-base"
                )}>
                  No medications scheduled for today
                </p>
                <Button
                  className="mt-4"
                  onClick={() => navigate('/medicines/new')}
                >
                  Add Your First Medicine
                </Button>
              </div>
            ) : (
              todaySchedule.map((item) => (
                <TodayScheduleItem
                  key={item.id}
                  item={item}
                  isElderlyMode={isElderlyMode}
                  onMarkAsTaken={handleDoseTaken}
                  onMarkAsSkipped={handleDoseSkipped}
                  onSnooze={handleSnooze}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/medicines')}>
            <CardContent className={cn(
              "p-6 text-center",
              isElderlyMode && "p-8"
            )}>
              <Pill className={cn(
                "mx-auto mb-3 text-blue-600",
                isElderlyMode ? "h-10 w-10" : "h-8 w-8"
              )} />
              <h3 className={cn(
                "font-semibold text-gray-900",
                isElderlyMode ? "text-xl" : "text-lg"
              )}>
                Manage Medicines
              </h3>
              <p className={cn(
                "text-gray-600 mt-1",
                isElderlyMode ? "text-base" : "text-sm"
              )}>
                Add, edit, or remove medications
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/history')}>
            <CardContent className={cn(
              "p-6 text-center",
              isElderlyMode && "p-8"
            )}>
              <TrendingUp className={cn(
                "mx-auto mb-3 text-green-600",
                isElderlyMode ? "h-10 w-10" : "h-8 w-8"
              )} />
              <h3 className={cn(
                "font-semibold text-gray-900",
                isElderlyMode ? "text-xl" : "text-lg"
              )}>
                View History
              </h3>
              <p className={cn(
                "text-gray-600 mt-1",
                isElderlyMode ? "text-base" : "text-sm"
              )}>
                Track your adherence over time
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/prescriptions')}>
            <CardContent className={cn(
              "p-6 text-center",
              isElderlyMode && "p-8"
            )}>
              <FileText className={cn(
                "mx-auto mb-3 text-purple-600",
                isElderlyMode ? "h-10 w-10" : "h-8 w-8"
              )} />
              <h3 className={cn(
                "font-semibold text-gray-900",
                isElderlyMode ? "text-xl" : "text-lg"
              )}>
                Prescriptions
              </h3>
              <p className={cn(
                "text-gray-600 mt-1",
                isElderlyMode ? "text-base" : "text-sm"
              )}>
                Upload and manage prescriptions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Caregiver Dashboard
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={cn(
            "font-bold text-gray-900",
            isElderlyMode ? "text-3xl" : "text-2xl"
          )}>
            Caregiver Dashboard
          </h1>
          <p className={cn(
            "text-gray-600 mt-1",
            isElderlyMode ? "text-lg" : "text-base"
          )}>
            Monitor your patients' medication adherence
          </p>
        </div>
        
        <Button
          onClick={() => navigate('/caregiver')}
          className={cn(
            isElderlyMode && "h-12 text-lg px-6"
          )}
        >
          <Users className={cn(
            "mr-2",
            isElderlyMode ? "h-6 w-6" : "h-4 w-4"
          )} />
          Manage Patients
        </Button>
      </div>

      {/* Caregiver content would go here */}
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Patients Connected
          </h3>
          <p className="text-gray-600 mb-4">
            Connect with patients to monitor their medication adherence
          </p>
          <Button onClick={() => navigate('/caregiver')}>
            Add Patient
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;