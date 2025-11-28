// User and Authentication Types
export type UserRole = "PATIENT" | "CAREGIVER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  elderlyMode?: boolean;
  timezone?: string;
  caregiverInviteCode?: string;
  createdAt: string;
}

// Medicine Types
export type MedicineForm = "tablet" | "capsule" | "liquid" | "injection" | "other";

export interface Medicine {
  id: string;
  userId: string;
  name: string;
  nickname?: string;
  strength: string; // e.g. "500mg"
  form: MedicineForm;
  colorTag?: string;
  iconKey?: string;
  stockCount: number;
  refillThreshold: number;
  createdAt: string;
  updatedAt: string;
}

// Schedule Types
export type FrequencyType = "DAILY" | "WEEKDAYS" | "CUSTOM_DAYS" | "EVERY_X_DAYS" | "EVERY_X_HOURS";

export interface Schedule {
  id: string;
  medicineId: string;
  frequencyType: FrequencyType;
  timesOfDay?: string[]; // "08:00", "13:00", ...
  daysOfWeek?: number[]; // 0-6 (Sunday = 0)
  intervalDays?: number;
  intervalHours?: number;
  startDate: string; // ISO
  endDate?: string;  // ISO or null for ongoing
  dosageAmount: number;
  dosageUnit: string; // "tablets", "ml", "mg", etc.
  createdAt: string;
  updatedAt: string;
}

// Dose Tracking Types
export type DoseStatus = "PENDING" | "TAKEN" | "MISSED" | "SKIPPED";

export interface DoseLog {
  id: string;
  userId: string;
  medicineId: string;
  scheduleId: string;
  scheduledTime: string; // ISO
  takenTime?: string;    // ISO
  status: DoseStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Today's Schedule Item (computed from Schedule + Medicine)
export interface TodayScheduleItem {
  id: string;
  medicineId: string;
  medicineName: string;
  medicineNickname?: string;
  strength: string;
  form: MedicineForm;
  colorTag?: string;
  iconKey?: string;
  scheduledTime: string; // ISO
  dosageAmount: number;
  dosageUnit: string;
  status: DoseStatus;
  doseLogId?: string;
  notes?: string;
}

// Notification Types
export type NotificationType = "DOSE_DUE" | "MISSED_DOSE" | "REFILL_WARNING" | "CAREGIVER_ALERT";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  medicineId?: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

// Caregiver Types
export interface CaregiverLink {
  id: string;
  caregiverId: string;
  patientId: string;
  patientName: string;
  caregiverName: string;
  createdAt: string;
  isActive: boolean;
}

// Prescription Types
export interface Prescription {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string; // "image/jpeg", "application/pdf", etc.
  ocrText?: string;
  parsedData?: PrescriptionParsedData;
  status: "UPLOADED" | "PROCESSING" | "PARSED" | "REVIEWED";
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionParsedData {
  medicines: Array<{
    name: string;
    strength: string;
    form: string;
    instructions: string;
    frequency: string;
    duration?: string;
    quantity?: string;
  }>;
  doctorName?: string;
  clinicName?: string;
  prescriptionDate?: string;
}

// Settings Types
export interface UserSettings {
  userId: string;
  elderlyMode: boolean;
  timezone: string;
  notificationPreferences: {
    inApp: boolean;
    browser: boolean;
    voice: boolean;
    email: boolean;
  };
  voiceSettings: {
    enabled: boolean;
    volume: number; // 0-1
    rate: number; // 0.1-10
    pitch: number; // 0-2
    voice?: string; // voice name
  };
  reminderSettings: {
    advanceNoticeMinutes: number; // how many minutes before dose time to remind
    snoozeMinutes: number; // snooze duration
    maxReminders: number; // max reminders for a single dose
  };
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form Types
export interface MedicineFormData {
  name: string;
  nickname?: string;
  strength: string;
  form: MedicineForm;
  colorTag?: string;
  iconKey?: string;
  stockCount: number;
  refillThreshold: number;
}

export interface ScheduleFormData {
  frequencyType: FrequencyType;
  timesOfDay: string[];
  daysOfWeek?: number[];
  intervalDays?: number;
  intervalHours?: number;
  startDate: string;
  endDate?: string;
  dosageAmount: number;
  dosageUnit: string;
}

// Chart/Analytics Types
export interface AdherenceData {
  date: string;
  taken: number;
  missed: number;
  skipped: number;
  total: number;
  adherencePercentage: number;
}

export interface MedicineAdherence {
  medicineId: string;
  medicineName: string;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  skippedDoses: number;
  adherencePercentage: number;
}

// Filter Types
export interface HistoryFilters {
  startDate?: string;
  endDate?: string;
  medicineId?: string;
  status?: DoseStatus;
  page: number;
  limit: number;
}

// Voice Reminder Types
export interface VoiceReminderOptions {
  text: string;
  volume?: number;
  rate?: number;
  pitch?: number;
  voice?: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;