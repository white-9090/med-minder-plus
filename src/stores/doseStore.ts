import { create } from 'zustand';
import { DoseLog, DoseStatus, TodayScheduleItem, AdherenceData, HistoryFilters, PaginatedResponse } from '../types';
import { format, startOfDay, endOfDay, subDays, parseISO } from 'date-fns';

interface DoseState {
  doseLogs: DoseLog[];
  todaySchedule: TodayScheduleItem[];
  isLoading: boolean;
  error: string | null;
  
  // Dose tracking actions
  fetchDoseLogs: (userId: string, filters?: HistoryFilters) => Promise<PaginatedResponse<DoseLog>>;
  logDose: (medicineId: string, scheduleId: string, status: DoseStatus, notes?: string) => Promise<void>;
  updateDoseLog: (id: string, updates: Partial<DoseLog>) => Promise<void>;
  
  // Today's schedule actions
  fetchTodaySchedule: (userId: string) => Promise<void>;
  markDoseAsTaken: (scheduleItemId: string, notes?: string) => Promise<void>;
  markDoseAsSkipped: (scheduleItemId: string, notes?: string) => Promise<void>;
  snoozeDose: (scheduleItemId: string, snoozeMinutes: number) => Promise<void>;
  
  // Analytics actions
  getAdherenceData: (userId: string, days: number) => Promise<AdherenceData[]>;
  getMedicineAdherence: (userId: string, medicineId: string, days: number) => Promise<number>;
  
  // Utility actions
  getDoseLogById: (id: string) => DoseLog | undefined;
  getTodayAdherence: () => { taken: number; total: number; percentage: number };
  getOverdueDoses: () => TodayScheduleItem[];
}

export const useDoseStore = create<DoseState>((set, get) => ({
  doseLogs: [],
  todaySchedule: [],
  isLoading: false,
  error: null,

  fetchDoseLogs: async (userId: string, filters?: HistoryFilters) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const stored = localStorage.getItem(`dose_logs_${userId}`);
      let doseLogs: DoseLog[] = stored ? JSON.parse(stored) : [];
      
      // Apply filters
      if (filters) {
        if (filters.startDate) {
          doseLogs = doseLogs.filter(log => 
            parseISO(log.scheduledTime) >= parseISO(filters.startDate!)
          );
        }
        if (filters.endDate) {
          doseLogs = doseLogs.filter(log => 
            parseISO(log.scheduledTime) <= parseISO(filters.endDate!)
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
        parseISO(b.scheduledTime).getTime() - parseISO(a.scheduledTime).getTime()
      );
      
      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLogs = doseLogs.slice(startIndex, endIndex);
      
      set({ doseLogs: paginatedLogs, isLoading: false });
      
      return {
        data: paginatedLogs,
        total: doseLogs.length,
        page,
        limit,
        hasMore: endIndex < doseLogs.length,
      };
    } catch (error) {
      set({ error: 'Failed to fetch dose logs', isLoading: false });
      throw error;
    }
  },

  logDose: async (medicineId: string, scheduleId: string, status: DoseStatus, notes?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const newDoseLog: DoseLog = {
        id: `dose_${Date.now()}`,
        userId: '', // Will be set by the calling component
        medicineId,
        scheduleId,
        scheduledTime: new Date().toISOString(),
        takenTime: status === 'TAKEN' ? new Date().toISOString() : undefined,
        status,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // This would typically be handled by the API
      // For now, we'll let the calling component handle localStorage
      
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to log dose', isLoading: false });
      throw error;
    }
  },

  updateDoseLog: async (id: string, updates: Partial<DoseLog>) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const { doseLogs } = get();
      const updatedLogs = doseLogs.map(log => 
        log.id === id 
          ? { ...log, ...updates, updatedAt: new Date().toISOString() }
          : log
      );
      
      set({ doseLogs: updatedLogs, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update dose log', isLoading: false });
    }
  },

  fetchTodaySchedule: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // This would typically be computed by the backend
      // For now, we'll generate a mock schedule
      const mockSchedule: TodayScheduleItem[] = [
        {
          id: 'today_1',
          medicineId: 'med_1',
          medicineName: 'Metformin',
          strength: '500mg',
          form: 'tablet',
          colorTag: '#3B82F6',
          scheduledTime: format(new Date().setHours(8, 0, 0, 0), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
          dosageAmount: 1,
          dosageUnit: 'tablet',
          status: 'PENDING',
        },
        {
          id: 'today_2',
          medicineId: 'med_2',
          medicineName: 'Lisinopril',
          strength: '10mg',
          form: 'tablet',
          colorTag: '#EF4444',
          scheduledTime: format(new Date().setHours(12, 0, 0, 0), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
          dosageAmount: 1,
          dosageUnit: 'tablet',
          status: 'PENDING',
        },
        {
          id: 'today_3',
          medicineId: 'med_1',
          medicineName: 'Metformin',
          strength: '500mg',
          form: 'tablet',
          colorTag: '#3B82F6',
          scheduledTime: format(new Date().setHours(20, 0, 0, 0), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
          dosageAmount: 1,
          dosageUnit: 'tablet',
          status: 'PENDING',
        },
      ];
      
      set({ todaySchedule: mockSchedule, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch today\'s schedule', isLoading: false });
    }
  },

  markDoseAsTaken: async (scheduleItemId: string, notes?: string) => {
    const { todaySchedule } = get();
    const updatedSchedule = todaySchedule.map(item => 
      item.id === scheduleItemId 
        ? { ...item, status: 'TAKEN' as DoseStatus, notes }
        : item
    );
    
    set({ todaySchedule: updatedSchedule });
    
    // Log the dose
    const item = todaySchedule.find(i => i.id === scheduleItemId);
    if (item) {
      await get().logDose(item.medicineId, scheduleItemId, 'TAKEN', notes);
    }
  },

  markDoseAsSkipped: async (scheduleItemId: string, notes?: string) => {
    const { todaySchedule } = get();
    const updatedSchedule = todaySchedule.map(item => 
      item.id === scheduleItemId 
        ? { ...item, status: 'SKIPPED' as DoseStatus, notes }
        : item
    );
    
    set({ todaySchedule: updatedSchedule });
    
    // Log the dose
    const item = todaySchedule.find(i => i.id === scheduleItemId);
    if (item) {
      await get().logDose(item.medicineId, scheduleItemId, 'SKIPPED', notes);
    }
  },

  snoozeDose: async (scheduleItemId: string, snoozeMinutes: number) => {
    const { todaySchedule } = get();
    const item = todaySchedule.find(i => i.id === scheduleItemId);
    
    if (item) {
      const newTime = new Date(parseISO(item.scheduledTime).getTime() + snoozeMinutes * 60000);
      const updatedSchedule = todaySchedule.map(scheduleItem => 
        scheduleItem.id === scheduleItemId 
          ? { ...scheduleItem, scheduledTime: newTime.toISOString() }
          : scheduleItem
      );
      
      set({ todaySchedule: updatedSchedule });
    }
  },

  getAdherenceData: async (userId: string, days: number) => {
    const stored = localStorage.getItem(`dose_logs_${userId}`);
    const doseLogs: DoseLog[] = stored ? JSON.parse(stored) : [];
    
    const adherenceData: AdherenceData[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayLogs = doseLogs.filter(log => {
        const logDate = parseISO(log.scheduledTime);
        return logDate >= dayStart && logDate <= dayEnd;
      });
      
      const taken = dayLogs.filter(log => log.status === 'TAKEN').length;
      const missed = dayLogs.filter(log => log.status === 'MISSED').length;
      const skipped = dayLogs.filter(log => log.status === 'SKIPPED').length;
      const total = dayLogs.length;
      
      adherenceData.unshift({
        date: format(date, 'yyyy-MM-dd'),
        taken,
        missed,
        skipped,
        total,
        adherencePercentage: total > 0 ? (taken / total) * 100 : 0,
      });
    }
    
    return adherenceData;
  },

  getMedicineAdherence: async (userId: string, medicineId: string, days: number) => {
    const stored = localStorage.getItem(`dose_logs_${userId}`);
    const doseLogs: DoseLog[] = stored ? JSON.parse(stored) : [];
    
    const cutoffDate = subDays(new Date(), days);
    const relevantLogs = doseLogs.filter(log => 
      log.medicineId === medicineId && parseISO(log.scheduledTime) >= cutoffDate
    );
    
    const taken = relevantLogs.filter(log => log.status === 'TAKEN').length;
    const total = relevantLogs.length;
    
    return total > 0 ? (taken / total) * 100 : 0;
  },

  getDoseLogById: (id: string) => {
    const { doseLogs } = get();
    return doseLogs.find(log => log.id === id);
  },

  getTodayAdherence: () => {
    const { todaySchedule } = get();
    const taken = todaySchedule.filter(item => item.status === 'TAKEN').length;
    const total = todaySchedule.length;
    
    return {
      taken,
      total,
      percentage: total > 0 ? (taken / total) * 100 : 0,
    };
  },

  getOverdueDoses: () => {
    const { todaySchedule } = get();
    const now = new Date();
    
    return todaySchedule.filter(item => 
      item.status === 'PENDING' && parseISO(item.scheduledTime) < now
    );
  },
}));