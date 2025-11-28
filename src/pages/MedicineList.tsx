import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle,
  Edit,
  Trash2,
  Calendar,
  Pill
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useMedicineStore } from '../stores/medicineStore';
import { useSettingsStore } from '../stores/settingsStore';
import MedicineCard from '../components/MedicineCard';
import { cn } from '../lib/utils';

const MedicineList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    medicines, 
    schedules, 
    fetchMedicines, 
    fetchSchedules, 
    deleteMedicine,
    getMedicinesNeedingRefill 
  } = useMedicineStore();
  const { settings } = useSettingsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'low_stock' | 'no_schedule'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const isElderlyMode = settings?.elderlyMode || false;

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        await Promise.all([
          fetchMedicines(user.id),
          fetchSchedules(user.id),
        ]);
      } catch (error) {
        console.error('Failed to load medicines:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, fetchMedicines, fetchSchedules]);

  const medicinesNeedingRefill = getMedicinesNeedingRefill();

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.nickname?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filterStatus) {
      case 'low_stock':
        return medicine.stockCount <= medicine.refillThreshold;
      case 'no_schedule':
        return !schedules.some(s => s.medicineId === medicine.id);
      case 'active':
        return medicine.stockCount > medicine.refillThreshold;
      default:
        return true;
    }
  });

  const handleEditMedicine = (medicineId: string) => {
    navigate(`/medicines/${medicineId}/edit`);
  };

  const handleDeleteMedicine = async (medicineId: string) => {
    if (window.confirm('Are you sure you want to delete this medicine? This will also remove all associated schedules.')) {
      await deleteMedicine(medicineId);
    }
  };

  const handleAddSchedule = (medicineId: string) => {
    navigate(`/medicines/${medicineId}/schedule`);
  };

  const getMedicineSchedules = (medicineId: string) => {
    return schedules.filter(s => s.medicineId === medicineId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={cn(
            "font-bold text-gray-900",
            isElderlyMode ? "text-3xl" : "text-2xl"
          )}>
            My Medicines
          </h1>
          <p className={cn(
            "text-gray-600 mt-1",
            isElderlyMode ? "text-lg" : "text-base"
          )}>
            Manage your medications and schedules
          </p>
        </div>
        
        <Button
          onClick={() => navigate('/medicines/new')}
          className={cn(
            "mt-4 md:mt-0",
            isElderlyMode && "h-12 text-lg px-6"
          )}
        >
          <Plus className={cn(
            "mr-2",
            isElderlyMode ? "h-6 w-6" : "h-4 w-4"
          )} />
          Add Medicine
        </Button>
      </div>

      {/* Alerts */}
      {medicinesNeedingRefill.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <span className={cn(
                "font-medium text-orange-800",
                isElderlyMode ? "text-lg" : "text-base"
              )}>
                {medicinesNeedingRefill.length} medicine{medicinesNeedingRefill.length !== 1 ? 's' : ''} need refilling
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "pl-10",
                    isElderlyMode && "h-12 text-lg"
                  )}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className={cn(
                  "w-40",
                  isElderlyMode && "h-12 text-lg"
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Medicines</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="no_schedule">No Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medicine Grid */}
      {filteredMedicines.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className={cn(
              "font-semibold text-gray-900 mb-2",
              isElderlyMode ? "text-2xl" : "text-xl"
            )}>
              {medicines.length === 0 ? 'No Medicines Added' : 'No Medicines Found'}
            </h3>
            <p className={cn(
              "text-gray-600 mb-4",
              isElderlyMode ? "text-lg" : "text-base"
            )}>
              {medicines.length === 0 
                ? 'Add your first medicine to get started with medication tracking'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {medicines.length === 0 && (
              <Button onClick={() => navigate('/medicines/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Medicine
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              schedules={getMedicineSchedules(medicine.id)}
              isElderlyMode={isElderlyMode}
              onEdit={() => handleEditMedicine(medicine.id)}
              onDelete={() => handleDeleteMedicine(medicine.id)}
              onAddSchedule={() => handleAddSchedule(medicine.id)}
            />
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className={cn(
            "p-4 text-center",
            isElderlyMode && "p-6"
          )}>
            <div className={cn(
              "font-bold text-blue-600",
              isElderlyMode ? "text-3xl" : "text-2xl"
            )}>
              {medicines.length}
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Total Medicines
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn(
            "p-4 text-center",
            isElderlyMode && "p-6"
          )}>
            <div className={cn(
              "font-bold text-green-600",
              isElderlyMode ? "text-3xl" : "text-2xl"
            )}>
              {schedules.length}
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Active Schedules
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
              {medicinesNeedingRefill.length}
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Need Refill
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn(
            "p-4 text-center",
            isElderlyMode && "p-6"
          )}>
            <div className={cn(
              "font-bold text-gray-600",
              isElderlyMode ? "text-3xl" : "text-2xl"
            )}>
              {medicines.filter(m => !schedules.some(s => s.medicineId === m.id)).length}
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              No Schedule
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicineList;