import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSettings } from '../types';

interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  
  // Settings actions
  fetchSettings: (userId: string) => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  toggleElderlyMode: () => void;
  updateNotificationPreferences: (preferences: Partial<UserSettings['notificationPreferences']>) => void;
  updateVoiceSettings: (voiceSettings: Partial<UserSettings['voiceSettings']>) => void;
  updateReminderSettings: (reminderSettings: Partial<UserSettings['reminderSettings']>) => void;
  resetToDefaults: (userId: string) => void;
}

const defaultSettings = (userId: string): UserSettings => ({
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
    voice: undefined,
  },
  reminderSettings: {
    advanceNoticeMinutes: 15,
    snoozeMinutes: 10,
    maxReminders: 3,
  },
  updatedAt: new Date().toISOString(),
});

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: null,
      isLoading: false,
      error: null,

      fetchSettings: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const stored = localStorage.getItem(`settings_${userId}`);
          const settings = stored ? JSON.parse(stored) : defaultSettings(userId);
          
          set({ settings, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch settings', isLoading: false });
        }
      },

      updateSettings: async (updates: Partial<UserSettings>) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const { settings } = get();
          if (!settings) return;
          
          const updatedSettings = {
            ...settings,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          
          // Save to localStorage
          localStorage.setItem(
            `settings_${settings.userId}`, 
            JSON.stringify(updatedSettings)
          );
          
          set({ settings: updatedSettings, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to update settings', isLoading: false });
        }
      },

      toggleElderlyMode: () => {
        const { settings, updateSettings } = get();
        if (settings) {
          updateSettings({ elderlyMode: !settings.elderlyMode });
        }
      },

      updateNotificationPreferences: (preferences: Partial<UserSettings['notificationPreferences']>) => {
        const { settings, updateSettings } = get();
        if (settings) {
          updateSettings({
            notificationPreferences: {
              ...settings.notificationPreferences,
              ...preferences,
            },
          });
        }
      },

      updateVoiceSettings: (voiceSettings: Partial<UserSettings['voiceSettings']>) => {
        const { settings, updateSettings } = get();
        if (settings) {
          updateSettings({
            voiceSettings: {
              ...settings.voiceSettings,
              ...voiceSettings,
            },
          });
        }
      },

      updateReminderSettings: (reminderSettings: Partial<UserSettings['reminderSettings']>) => {
        const { settings, updateSettings } = get();
        if (settings) {
          updateSettings({
            reminderSettings: {
              ...settings.reminderSettings,
              ...reminderSettings,
            },
          });
        }
      },

      resetToDefaults: (userId: string) => {
        const defaults = defaultSettings(userId);
        
        // Save to localStorage
        localStorage.setItem(`settings_${userId}`, JSON.stringify(defaults));
        
        set({ settings: defaults });
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);