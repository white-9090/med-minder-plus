import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Users, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Pill,
  TrendingUp,
  UserPlus,
  Settings,
  Bell
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { cn } from '../lib/utils';

interface PatientSummary {
  id: string;
  name: string;
  email: string;
  lastActive: string;
  adherenceRate: number;
  overdueDoses: number;
  totalMedicines: number;
  status: 'active' | 'inactive' | 'needs_attention';
}

const CaregiverDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();

  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatientEmail, setNewPatientEmail] = useState('');

  const isElderlyMode = settings?.elderlyMode || false;

  useEffect(() => {
    // Simulate loading patient data
    const loadPatients = async () => {
      setIsLoading(true);
      
      // Mock patient data
      const mockPatients: PatientSummary[] = [
        {
          id: '1',
          name: 'Mary Johnson',
          email: 'mary.johnson@email.com',
          lastActive: '2024-11-28T08:30:00Z',
          adherenceRate: 95,
          overdueDoses: 0,
          totalMedicines: 4,
          status: 'active'
        },
        {
          id: '2',
          name: 'Robert Smith',
          email: 'robert.smith@email.com',
          lastActive: '2024-11-27T14:15:00Z',
          adherenceRate: 78,
          overdueDoses: 2,
          totalMedicines: 6,
          status: 'needs_attention'
        },
        {
          id: '3',
          name: 'Eleanor Davis',
          email: 'eleanor.davis@email.com',
          lastActive: '2024-11-26T10:45:00Z',
          adherenceRate: 88,
          overdueDoses: 1,
          totalMedicines: 3,
          status: 'active'
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      setPatients(mockPatients);
      setIsLoading(false);
    };

    loadPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: PatientSummary['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'needs_attention':
        return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAddPatient = async () => {
    if (!newPatientEmail.trim()) return;

    // Simulate adding patient
    const newPatient: PatientSummary = {
      id: Date.now().toString(),
      name: 'New Patient',
      email: newPatientEmail,
      lastActive: new Date().toISOString(),
      adherenceRate: 100,
      overdueDoses: 0,
      totalMedicines: 0,
      status: 'active'
    };

    setPatients(prev => [...prev, newPatient]);
    setNewPatientEmail('');
    setShowAddPatient(false);
  };

  const totalPatients = patients.length;
  const patientsNeedingAttention = patients.filter(p => p.status === 'needs_attention').length;
  const averageAdherence = patients.length > 0 
    ? patients.reduce((sum, p) => sum + p.adherenceRate, 0) / patients.length 
    : 0;
  const totalOverdueDoses = patients.reduce((sum, p) => sum + p.overdueDoses, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient data...</p>
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
            Caregiver Dashboard
          </h1>
          <p className={cn(
            "text-gray-600 mt-1",
            isElderlyMode ? "text-lg" : "text-base"
          )}>
            Monitor and support your patients' medication adherence
          </p>
        </div>
        
        <Button
          onClick={() => setShowAddPatient(true)}
          className={cn(
            "mt-4 md:mt-0",
            isElderlyMode && "h-12 text-lg px-6"
          )}
        >
          <UserPlus className={cn(
            "mr-2",
            isElderlyMode ? "h-6 w-6" : "h-4 w-4"
          )} />
          Add Patient
        </Button>
      </div>

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
              {totalPatients}
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Total Patients
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
              {averageAdherence.toFixed(0)}%
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Avg. Adherence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn(
            "p-4 text-center",
            isElderlyMode && "p-6"
          )}>
            <div className={cn(
              "font-bold text-red-600",
              isElderlyMode ? "text-3xl" : "text-2xl"
            )}>
              {patientsNeedingAttention}
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Need Attention
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
              {totalOverdueDoses}
            </div>
            <p className={cn(
              "text-gray-600",
              isElderlyMode ? "text-base" : "text-sm"
            )}>
              Overdue Doses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {patientsNeedingAttention > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className={cn(
              "font-medium text-orange-800",
              isElderlyMode ? "text-lg" : "text-base"
            )}>
              {patientsNeedingAttention} patient{patientsNeedingAttention !== 1 ? 's' : ''} need{patientsNeedingAttention === 1 ? 's' : ''} your attention
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Add Patient Form */}
      {showAddPatient && (
        <Card>
          <CardHeader>
            <CardTitle className={cn(
              isElderlyMode ? "text-2xl" : "text-xl"
            )}>
              Add New Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Enter patient's email address"
                value={newPatientEmail}
                onChange={(e) => setNewPatientEmail(e.target.value)}
                className={cn(
                  isElderlyMode && "h-12 text-lg"
                )}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleAddPatient}
                disabled={!newPatientEmail.trim()}
                className={cn(
                  isElderlyMode && "h-12 text-lg px-6"
                )}
              >
                Send Invitation
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddPatient(false);
                  setNewPatientEmail('');
                }}
                className={cn(
                  isElderlyMode && "h-12 text-lg px-6"
                )}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "pl-10",
                isElderlyMode && "h-12 text-lg"
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(
            "flex items-center",
            isElderlyMode ? "text-2xl" : "text-xl"
          )}>
            <Users className={cn(
              "mr-2",
              isElderlyMode ? "h-7 w-7" : "h-5 w-5"
            )} />
            Your Patients
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className={cn(
                "font-semibold text-gray-900 mb-2",
                isElderlyMode ? "text-2xl" : "text-xl"
              )}>
                {patients.length === 0 ? 'No Patients Added' : 'No Matching Patients'}
              </h3>
              <p className={cn(
                "text-gray-600 mb-4",
                isElderlyMode ? "text-lg" : "text-base"
              )}>
                {patients.length === 0 
                  ? 'Add patients to start monitoring their medication adherence'
                  : 'Try adjusting your search criteria'
                }
              </p>
              {patients.length === 0 && (
                <Button onClick={() => setShowAddPatient(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Your First Patient
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <Card key={patient.id} className="border-l-4 border-l-blue-500">
                  <CardContent className={cn(
                    "p-4",
                    isElderlyMode && "p-6"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={cn(
                            "font-semibold text-gray-900",
                            isElderlyMode ? "text-xl" : "text-lg"
                          )}>
                            {patient.name}
                          </h3>
                          {getStatusBadge(patient.status)}
                        </div>
                        
                        <p className={cn(
                          "text-gray-600 mb-3",
                          isElderlyMode ? "text-base" : "text-sm"
                        )}>
                          {patient.email}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className={cn(
                              "text-gray-500",
                              isElderlyMode ? "text-sm" : "text-xs"
                            )}>
                              Adherence Rate
                            </p>
                            <p className={cn(
                              "font-semibold",
                              getAdherenceColor(patient.adherenceRate),
                              isElderlyMode ? "text-lg" : "text-base"
                            )}>
                              {patient.adherenceRate}%
                            </p>
                          </div>
                          
                          <div>
                            <p className={cn(
                              "text-gray-500",
                              isElderlyMode ? "text-sm" : "text-xs"
                            )}>
                              Overdue Doses
                            </p>
                            <p className={cn(
                              "font-semibold",
                              patient.overdueDoses > 0 ? "text-red-600" : "text-green-600",
                              isElderlyMode ? "text-lg" : "text-base"
                            )}>
                              {patient.overdueDoses}
                            </p>
                          </div>
                          
                          <div>
                            <p className={cn(
                              "text-gray-500",
                              isElderlyMode ? "text-sm" : "text-xs"
                            )}>
                              Medicines
                            </p>
                            <p className={cn(
                              "font-semibold text-gray-900",
                              isElderlyMode ? "text-lg" : "text-base"
                            )}>
                              {patient.totalMedicines}
                            </p>
                          </div>
                          
                          <div>
                            <p className={cn(
                              "text-gray-500",
                              isElderlyMode ? "text-sm" : "text-xs"
                            )}>
                              Last Active
                            </p>
                            <p className={cn(
                              "font-semibold text-gray-900",
                              isElderlyMode ? "text-lg" : "text-base"
                            )}>
                              {new Date(patient.lastActive).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="outline"
                          size={isElderlyMode ? "default" : "sm"}
                        >
                          <TrendingUp className={cn(
                            "mr-1",
                            isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                          )} />
                          View Details
                        </Button>
                        
                        <Button
                          variant="outline"
                          size={isElderlyMode ? "default" : "sm"}
                        >
                          <Bell className={cn(
                            "mr-1",
                            isElderlyMode ? "h-5 w-5" : "h-4 w-4"
                          )} />
                          Send Alert
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
    </div>
  );
};

export default CaregiverDashboard;