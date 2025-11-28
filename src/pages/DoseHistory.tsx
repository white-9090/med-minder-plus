import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { 
  CalendarIcon, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Download
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useDoseStore } from '../stores/doseStore';
import { useMedicineStore } from '../stores/medicineStore';
import { useSettingsStore } from '../stores/settingsStore';
import PillTag from '../components/PillTag';
import { cn } from '../lib/utils';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const DoseHistory: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    doseHistory, 
    fetchDoseHistory, 
    getAdherenceStats,
    getStreakData 
  } = useDoseStore();
  const { medicines, fetchMedicines } = useMedicineStore();
  const { settings } = useSettingsStore();

  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [selectedMedicine, setSelectedMedicine] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const isElderlyMode = settings?.elderlyMode || false;

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        await Promise.all([
          fetchDoseHistory(user.id, {
            startDate: format(dateRange.from, 'yyyy-MM-dd'),
            endDate: format(dateRange.to, 'yyyy-MM-dd'),
            medicineId: selectedMedicine === 'all' ? undefined : selectedMedicine,
            status: statusFilter === 'all' ? undefined : statusFilter as any,
          }),
          fetchMedicines(user.id),
        ]);
      } catch (error) {
        console.error('Failed to load dose history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, dateRange, selectedMedicine, statusFilter, fetchDoseHistory, fetchMedicines]);

  const adherenceStats = getAdherenceStats(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd')
  );

  const streakData = getStreakData();

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    setCalendarOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TAKEN':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'SKIPPED':
        return <XCircle className="h-4 w-4 text-yellow-600" />;
      case 'MISSED':
        return <Clock className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TAKEN':
        return <Badge className="bg-green-100 text-green-800">Taken</Badge>;
      case 'SKIPPED':
        return <Badge className="bg-yellow-100 text-yellow-800">Skipped</Badge>;
      case 'MISSED':
        return <Badge variant="destructive">Missed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getMedicineInfo = (medicineId: string) => {
    return medicines.find(m => m.id === medicineId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dose history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={cn(
          "font-bold text-gray-900",
          isElderlyMode ? "text-3xl" : "text-2xl"
        )}>
          Dose History & Analytics
        </h1>
        <p className={cn(
          "text-gray-600 mt-1",
          isElderlyMode ? "text-lg" : "text-base"
        )}>
          Track your medication adherence over time
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className={cn(
            "p-4 text-center",
            isElderlyMode && "p-6"
          )}>
            <div className={cn(
              "font-bold text-green-600",
              isElderlyMode ? "text-3xl" : "text-2xl"
            )}>
              {adherenceStats.percentage.toFixed(1)}%
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Adherence Rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn(
            "p-4 text-center",
            isElderlyMode && "p-6"
          )}>
            <div className={cn(
              "font-bold text-blue-600",
              isElderlyMode ? "text-3xl" : "text-2xl"
            )}>
              {adherenceStats.taken}
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Doses Taken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn(
            "p-4 text-center",
            isElderlyMode && "p-6"
          )}>
            <div className={cn(
              "font-bold text-orange-600",
              isElderlyMode ? "text-3xl" : "text-2xl"
            )}>
              {streakData.current}
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Current Streak
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn(
            "p-4 text-center",
            isElderlyMode && "p-6"
          )}>
            <div className={cn(
              "font-bold text-purple-600",
              isElderlyMode ? "text-3xl" : "text-2xl"
            )}>
              {streakData.longest}
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Longest Streak
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Date Range */}
            <div className="flex-1">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      isElderlyMode && "h-12 text-lg"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        handleDateRangeChange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Medicine Filter */}
            <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
              <SelectTrigger className={cn(
                "w-48",
                isElderlyMode && "h-12 text-lg"
              )}>
                <SelectValue placeholder="All medicines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Medicines</SelectItem>
                {medicines.map(medicine => (
                  <SelectItem key={medicine.id} value={medicine.id}>
                    {medicine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={cn(
                "w-32",
                isElderlyMode && "h-12 text-lg"
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="TAKEN">Taken</SelectItem>
                <SelectItem value="SKIPPED">Skipped</SelectItem>
                <SelectItem value="MISSED">Missed</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button
              variant="outline"
              className={cn(
                isElderlyMode && "h-12 text-lg px-6"
              )}
            >
              <Download className={cn(
                "mr-2",
                isElderlyMode ? "h-6 w-6" : "h-4 w-4"
              )} />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(
            "flex items-center",
            isElderlyMode ? "text-2xl" : "text-xl"
          )}>
            <TrendingUp className={cn(
              "mr-2",
              isElderlyMode ? "h-7 w-7" : "h-5 w-5"
            )} />
            Dose History
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {doseHistory.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className={cn(
                "font-semibold text-gray-900 mb-2",
                isElderlyMode ? "text-2xl" : "text-xl"
              )}>
                No Dose History
              </h3>
              <p className={cn(
                "text-gray-600",
                isElderlyMode ? "text-lg" : "text-base"
              )}>
                No dose records found for the selected period
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {doseHistory.map((dose) => {
                const medicine = getMedicineInfo(dose.medicineId);
                if (!medicine) return null;

                return (
                  <Card key={dose.id} className="border-l-4 border-l-gray-200">
                    <CardContent className={cn(
                      "p-4",
                      isElderlyMode && "p-6"
                    )}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="mt-1">
                            {getStatusIcon(dose.status)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <PillTag
                                name={medicine.name}
                                strength={medicine.strength}
                                form={medicine.form}
                                colorTag={medicine.colorTag}
                                size={isElderlyMode ? 'md' : 'sm'}
                                showForm={false}
                              />
                              <Badge variant="outline" className={cn(
                                isElderlyMode && "text-base px-3 py-1"
                              )}>
                                {dose.dosageAmount} {dose.dosageUnit}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>
                                Scheduled: {format(new Date(dose.scheduledTime), 'MMM d, h:mm a')}
                              </span>
                              {dose.actualTime && (
                                <span>
                                  Taken: {format(new Date(dose.actualTime), 'MMM d, h:mm a')}
                                </span>
                              )}
                            </div>
                            
                            {dose.notes && (
                              <p className={cn(
                                "text-gray-700 mt-2",
                                isElderlyMode ? "text-base" : "text-sm"
                              )}>
                                <strong>Note:</strong> {dose.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          {getStatusBadge(dose.status)}
                          {dose.actualTime && dose.scheduledTime && (
                            <span className={cn(
                              "text-gray-500",
                              isElderlyMode ? "text-sm" : "text-xs"
                            )}>
                              {new Date(dose.actualTime) > new Date(dose.scheduledTime) 
                                ? 'Late' 
                                : 'On time'
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoseHistory;