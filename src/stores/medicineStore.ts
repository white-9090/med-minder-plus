import { create } from 'zustand';
import { Medicine, Schedule, MedicineFormData, ScheduleFormData } from '../types';

interface MedicineState {
  medicines: Medicine[];
  schedules: Schedule[];
  isLoading: boolean;
  error: string | null;
  
  // Medicine actions
  fetchMedicines: (userId: string) => Promise<void>;
  addMedicine: (medicineData: MedicineFormData, userId: string) => Promise<Medicine>;
  updateMedicine: (id: string, updates: Partial<Medicine>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  updateMedicineStock: (id: string, newStock: number) => Promise<void>;
  
  // Schedule actions
  fetchSchedules: (userId: string) => Promise<void>;
  addSchedule: (medicineId: string, scheduleData: ScheduleFormData) => Promise<Schedule>;
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  
  // Utility actions
  getMedicineById: (id: string) => Medicine | undefined;
  getSchedulesByMedicineId: (medicineId: string) => Schedule[];
  getMedicinesNeedingRefill: () => Medicine[];
}

export const useMedicineStore = create<MedicineState>((set, get) => ({
  medicines: [],
  schedules: [],
  isLoading: false,
  error: null,

  fetchMedicines: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call - in real app, this would fetch from backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get from localStorage
      const stored = localStorage.getItem(`medicines_${userId}`);
      const medicines = stored ? JSON.parse(stored) : [];
      
      set({ medicines, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch medicines', isLoading: false });
    }
  },

  addMedicine: async (medicineData: MedicineFormData, userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newMedicine: Medicine = {
        id: `med_${Date.now()}`,
        userId,
        ...medicineData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { medicines } = get();
      const updatedMedicines = [...medicines, newMedicine];
      
      // Save to localStorage
      localStorage.setItem(`medicines_${userId}`, JSON.stringify(updatedMedicines));
      
      set({ medicines: updatedMedicines, isLoading: false });
      return newMedicine;
    } catch (error) {
      set({ error: 'Failed to add medicine', isLoading: false });
      throw error;
    }
  },

  updateMedicine: async (id: string, updates: Partial<Medicine>) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { medicines } = get();
      const updatedMedicines = medicines.map(med => 
        med.id === id 
          ? { ...med, ...updates, updatedAt: new Date().toISOString() }
          : med
      );
      
      // Save to localStorage
      const userId = medicines.find(m => m.id === id)?.userId;
      if (userId) {
        localStorage.setItem(`medicines_${userId}`, JSON.stringify(updatedMedicines));
      }
      
      set({ medicines: updatedMedicines, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update medicine', isLoading: false });
    }
  },

  deleteMedicine: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { medicines, schedules } = get();
      const medicine = medicines.find(m => m.id === id);
      
      if (medicine) {
        // Remove medicine
        const updatedMedicines = medicines.filter(med => med.id !== id);
        
        // Remove associated schedules
        const updatedSchedules = schedules.filter(schedule => schedule.medicineId !== id);
        
        // Save to localStorage
        localStorage.setItem(`medicines_${medicine.userId}`, JSON.stringify(updatedMedicines));
        localStorage.setItem(`schedules_${medicine.userId}`, JSON.stringify(updatedSchedules));
        
        set({ 
          medicines: updatedMedicines, 
          schedules: updatedSchedules,
          isLoading: false 
        });
      }
    } catch (error) {
      set({ error: 'Failed to delete medicine', isLoading: false });
    }
  },

  updateMedicineStock: async (id: string, newStock: number) => {
    const { updateMedicine } = get();
    await updateMedicine(id, { stockCount: newStock });
  },

  fetchSchedules: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const stored = localStorage.getItem(`schedules_${userId}`);
      const schedules = stored ? JSON.parse(stored) : [];
      
      set({ schedules, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch schedules', isLoading: false });
    }
  },

  addSchedule: async (medicineId: string, scheduleData: ScheduleFormData) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newSchedule: Schedule = {
        id: `schedule_${Date.now()}`,
        medicineId,
        ...scheduleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { schedules, medicines } = get();
      const medicine = medicines.find(m => m.id === medicineId);
      const updatedSchedules = [...schedules, newSchedule];
      
      if (medicine) {
        localStorage.setItem(`schedules_${medicine.userId}`, JSON.stringify(updatedSchedules));
      }
      
      set({ schedules: updatedSchedules, isLoading: false });
      return newSchedule;
    } catch (error) {
      set({ error: 'Failed to add schedule', isLoading: false });
      throw error;
    }
  },

  updateSchedule: async (id: string, updates: Partial<Schedule>) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { schedules, medicines } = get();
      const updatedSchedules = schedules.map(schedule => 
        schedule.id === id 
          ? { ...schedule, ...updates, updatedAt: new Date().toISOString() }
          : schedule
      );
      
      // Save to localStorage
      const schedule = schedules.find(s => s.id === id);
      if (schedule) {
        const medicine = medicines.find(m => m.id === schedule.medicineId);
        if (medicine) {
          localStorage.setItem(`schedules_${medicine.userId}`, JSON.stringify(updatedSchedules));
        }
      }
      
      set({ schedules: updatedSchedules, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update schedule', isLoading: false });
    }
  },

  deleteSchedule: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { schedules, medicines } = get();
      const schedule = schedules.find(s => s.id === id);
      const updatedSchedules = schedules.filter(s => s.id !== id);
      
      if (schedule) {
        const medicine = medicines.find(m => m.id === schedule.medicineId);
        if (medicine) {
          localStorage.setItem(`schedules_${medicine.userId}`, JSON.stringify(updatedSchedules));
        }
      }
      
      set({ schedules: updatedSchedules, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to delete schedule', isLoading: false });
    }
  },

  getMedicineById: (id: string) => {
    const { medicines } = get();
    return medicines.find(medicine => medicine.id === id);
  },

  getSchedulesByMedicineId: (medicineId: string) => {
    const { schedules } = get();
    return schedules.filter(schedule => schedule.medicineId === medicineId);
  },

  getMedicinesNeedingRefill: () => {
    const { medicines } = get();
    return medicines.filter(medicine => medicine.stockCount <= medicine.refillThreshold);
  },
}));