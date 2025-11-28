import { 
  User, 
  Medicine, 
  Schedule, 
  DoseLog, 
  AppNotification, 
  Prescription,
  UserSettings,
  CaregiverLink,
  ApiResponse,
  PaginatedResponse,
  HistoryFilters,
  MedicineFormData,
  ScheduleFormData,
  UserRole
} from '../types';

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API class that simulates REST calls with localStorage persistence
export class MockAPI {
  // Authentication endpoints
  static async login(email: string, password: string): Promise<ApiResponse<User>> {
    await delay(800);
    
    // Mock authentication - in real app, this would validate credentials
    const mockUser: User = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'PATIENT',
      elderlyMode: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      caregiverInviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    // Store user in localStorage
    localStorage.setItem(`user_${mockUser.id}`, JSON.stringify(mockUser));
    
    return {
      success: true,
      data: mockUser,
      message: 'Login successful'
    };
  }

  static async signup(name: string, email: string, password: string, role: UserRole): Promise<ApiResponse<User>> {
    await delay(1000);
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      role,
      elderlyMode: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      caregiverInviteCode: role === 'PATIENT' 
        ? Math.random().toString(36).substring(2, 8).toUpperCase()
        : undefined,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(`user_${newUser.id}`, JSON.stringify(newUser));
    
    return {
      success: true,
      data: newUser,
      message: 'Account created successfully'
    };
  }

  // Medicine endpoints
  static async getMedicines(userId: string): Promise<ApiResponse<Medicine[]>> {
    await delay();
    
    const stored = localStorage.getItem(`medicines_${userId}`);
    const medicines = stored ? JSON.parse(stored) : [];
    
    return {
      success: true,
      data: medicines
    };
  }

  static async createMedicine(userId: string, medicineData: MedicineFormData): Promise<ApiResponse<Medicine>> {
    await delay(500);
    
    const newMedicine: Medicine = {
      id: `med_${Date.now()}`,
      userId,
      ...medicineData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const stored = localStorage.getItem(`medicines_${userId}`);
    const medicines = stored ? JSON.parse(stored) : [];
    medicines.push(newMedicine);
    
    localStorage.setItem(`medicines_${userId}`, JSON.stringify(medicines));
    
    return {
      success: true,
      data: newMedicine,
      message: 'Medicine added successfully'
    };
  }

  static async updateMedicine(id: string, updates: Partial<Medicine>): Promise<ApiResponse<Medicine>> {
    await delay(400);
    
    // Find the medicine to get userId
    let medicine: Medicine | null = null;
    let userId = '';
    
    // Search through all user medicine stores (in real app, we'd have the userId)
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('medicines_')) {
        const medicines: Medicine[] = JSON.parse(localStorage.getItem(key) || '[]');
        const found = medicines.find(m => m.id === id);
        if (found) {
          medicine = found;
          userId = key.replace('medicines_', '');
          break;
        }
      }
    }
    
    if (!medicine) {
      return {
        success: false,
        error: 'Medicine not found'
      };
    }
    
    const stored = localStorage.getItem(`medicines_${userId}`);
    const medicines: Medicine[] = stored ? JSON.parse(stored) : [];
    const updatedMedicines = medicines.map(med => 
      med.id === id 
        ? { ...med, ...updates, updatedAt: new Date().toISOString() }
        : med
    );
    
    localStorage.setItem(`medicines_${userId}`, JSON.stringify(updatedMedicines));
    
    const updatedMedicine = updatedMedicines.find(m => m.id === id)!;
    
    return {
      success: true,
      data: updatedMedicine,
      message: 'Medicine updated successfully'
    };
  }

  static async deleteMedicine(id: string): Promise<ApiResponse<void>> {
    await delay(300);
    
    // Find and remove medicine from all user stores
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('medicines_')) {
        const medicines: Medicine[] = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = medicines.filter(m => m.id !== id);
        
        if (filtered.length !== medicines.length) {
          localStorage.setItem(key, JSON.stringify(filtered));
          
          // Also remove associated schedules
          const userId = key.replace('medicines_', '');
          const scheduleKey = `schedules_${userId}`;
          const schedules: Schedule[] = JSON.parse(localStorage.getItem(scheduleKey) || '[]');
          const filteredSchedules = schedules.filter(s => s.medicineId !== id);
          localStorage.setItem(scheduleKey, JSON.stringify(filteredSchedules));
          
          break;
        }
      }
    }
    
    return {
      success: true,
      message: 'Medicine deleted successfully'
    };
  }

  // Schedule endpoints
  static async getSchedules(userId: string): Promise<ApiResponse<Schedule[]>> {
    await delay();
    
    const stored = localStorage.getItem(`schedules_${userId}`);
    const schedules = stored ? JSON.parse(stored) : [];
    
    return {
      success: true,
      data: schedules
    };
  }

  static async createSchedule(medicineId: string, scheduleData: ScheduleFormData): Promise<ApiResponse<Schedule>> {
    await delay(400);
    
    const newSchedule: Schedule = {
      id: `schedule_${Date.now()}`,
      medicineId,
      ...scheduleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Find userId from medicine
    let userId = '';
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('medicines_')) {
        const medicines: Medicine[] = JSON.parse(localStorage.getItem(key) || '[]');
        if (medicines.find(m => m.id === medicineId)) {
          userId = key.replace('medicines_', '');
          break;
        }
      }
    }
    
    if (userId) {
      const stored = localStorage.getItem(`schedules_${userId}`);
      const schedules = stored ? JSON.parse(stored) : [];
      schedules.push(newSchedule);
      localStorage.setItem(`schedules_${userId}`, JSON.stringify(schedules));
    }
    
    return {
      success: true,
      data: newSchedule,
      message: 'Schedule created successfully'
    };
  }

  // Dose tracking endpoints
  static async getDoseLogs(userId: string, filters?: HistoryFilters): Promise<ApiResponse<PaginatedResponse<DoseLog>>> {
    await delay();
    
    const stored = localStorage.getItem(`dose_logs_${userId}`);
    let doseLogs: DoseLog[] = stored ? JSON.parse(stored) : [];
    
    // Apply filters
    if (filters) {
      if (filters.startDate) {
        doseLogs = doseLogs.filter(log => 
          new Date(log.scheduledTime) >= new Date(filters.startDate!)
        );
      }
      if (filters.endDate) {
        doseLogs = doseLogs.filter(log => 
          new Date(log.scheduledTime) <= new Date(filters.endDate!)
        );
      }
      if (filters.medicineId) {
        doseLogs = doseLogs.filter(log => log.medicineId === filters.medicineId);
      }
      if (filters.status) {
        doseLogs = doseLogs.filter(log => log.status === filters.status);
      }
    }
    
    // Sort by scheduled time (newest first)
    doseLogs.sort((a, b) => 
      new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
    );
    
    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = doseLogs.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: {
        data: paginatedLogs,
        total: doseLogs.length,
        page,
        limit,
        hasMore: endIndex < doseLogs.length,
      }
    };
  }

  static async createDoseLog(doseLog: Omit<DoseLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<DoseLog>> {
    await delay(200);
    
    const newDoseLog: DoseLog = {
      ...doseLog,
      id: `dose_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const stored = localStorage.getItem(`dose_logs_${doseLog.userId}`);
    const doseLogs = stored ? JSON.parse(stored) : [];
    doseLogs.push(newDoseLog);
    
    localStorage.setItem(`dose_logs_${doseLog.userId}`, JSON.stringify(doseLogs));
    
    return {
      success: true,
      data: newDoseLog,
      message: 'Dose logged successfully'
    };
  }

  // Notification endpoints
  static async getNotifications(userId: string): Promise<ApiResponse<AppNotification[]>> {
    await delay();
    
    const stored = localStorage.getItem(`notifications_${userId}`);
    const notifications = stored ? JSON.parse(stored) : [];
    
    return {
      success: true,
      data: notifications
    };
  }

  static async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    await delay(100);
    
    // Find and update notification
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('notifications_')) {
        const notifications: AppNotification[] = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        );
        
        if (JSON.stringify(updated) !== JSON.stringify(notifications)) {
          localStorage.setItem(key, JSON.stringify(updated));
          break;
        }
      }
    }
    
    return {
      success: true,
      message: 'Notification marked as read'
    };
  }

  // Settings endpoints
  static async getSettings(userId: string): Promise<ApiResponse<UserSettings>> {
    await delay();
    
    const stored = localStorage.getItem(`settings_${userId}`);
    const settings = stored ? JSON.parse(stored) : {
      userId,
      elderlyMode: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notificationPreferences: {
        inApp: true,
        browser: true,
        voice: false,
        email: false,
      },
      voiceSettings: {
        enabled: false,
        volume: 0.8,
        rate: 1.0,
        pitch: 1.0,
      },
      reminderSettings: {
        advanceNoticeMinutes: 15,
        snoozeMinutes: 10,
        maxReminders: 3,
      },
      updatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: settings
    };
  }

  static async updateSettings(userId: string, updates: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    await delay(200);
    
    const stored = localStorage.getItem(`settings_${userId}`);
    const currentSettings = stored ? JSON.parse(stored) : {};
    
    const updatedSettings = {
      ...currentSettings,
      ...updates,
      userId,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(`settings_${userId}`, JSON.stringify(updatedSettings));
    
    return {
      success: true,
      data: updatedSettings,
      message: 'Settings updated successfully'
    };
  }

  // Prescription endpoints
  static async uploadPrescription(userId: string, file: File): Promise<ApiResponse<Prescription>> {
    await delay(2000); // Simulate longer upload time
    
    // Simulate file upload and OCR processing
    const prescription: Prescription = {
      id: `prescription_${Date.now()}`,
      userId,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file), // In real app, this would be a server URL
      fileType: file.type,
      status: 'PARSED',
      ocrText: 'Mock OCR text extracted from prescription...',
      parsedData: {
        medicines: [
          {
            name: 'Metformin',
            strength: '500mg',
            form: 'tablet',
            instructions: 'Take twice daily with meals',
            frequency: 'twice daily',
            duration: '30 days',
            quantity: '60 tablets',
          },
          {
            name: 'Lisinopril',
            strength: '10mg',
            form: 'tablet',
            instructions: 'Take once daily',
            frequency: 'once daily',
            duration: '30 days',
            quantity: '30 tablets',
          },
        ],
        doctorName: 'Dr. Smith',
        clinicName: 'Family Health Clinic',
        prescriptionDate: new Date().toISOString().split('T')[0],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const stored = localStorage.getItem(`prescriptions_${userId}`);
    const prescriptions = stored ? JSON.parse(stored) : [];
    prescriptions.push(prescription);
    
    localStorage.setItem(`prescriptions_${userId}`, JSON.stringify(prescriptions));
    
    return {
      success: true,
      data: prescription,
      message: 'Prescription uploaded and processed successfully'
    };
  }

  // Caregiver endpoints
  static async linkCaregiver(patientInviteCode: string, caregiverId: string): Promise<ApiResponse<CaregiverLink>> {
    await delay(500);
    
    // Find patient by invite code
    let patient: User | null = null;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('user_')) {
        const user: User = JSON.parse(localStorage.getItem(key) || '{}');
        if (user.caregiverInviteCode === patientInviteCode) {
          patient = user;
          break;
        }
      }
    }
    
    if (!patient) {
      return {
        success: false,
        error: 'Invalid invite code'
      };
    }
    
    const caregiverLink: CaregiverLink = {
      id: `link_${Date.now()}`,
      caregiverId,
      patientId: patient.id,
      patientName: patient.name,
      caregiverName: 'Caregiver', // In real app, we'd fetch this
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    const stored = localStorage.getItem(`caregiver_links_${caregiverId}`);
    const links = stored ? JSON.parse(stored) : [];
    links.push(caregiverLink);
    
    localStorage.setItem(`caregiver_links_${caregiverId}`, JSON.stringify(links));
    
    return {
      success: true,
      data: caregiverLink,
      message: 'Successfully linked to patient'
    };
  }

  static async getCaregiverLinks(caregiverId: string): Promise<ApiResponse<CaregiverLink[]>> {
    await delay();
    
    const stored = localStorage.getItem(`caregiver_links_${caregiverId}`);
    const links = stored ? JSON.parse(stored) : [];
    
    return {
      success: true,
      data: links
    };
  }
}

export default MockAPI;