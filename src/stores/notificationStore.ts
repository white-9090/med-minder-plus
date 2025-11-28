import { create } from 'zustand';
import { AppNotification, NotificationType } from '../types';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Notification actions
  fetchNotifications: (userId: string) => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Utility actions
  getUnreadNotifications: () => AppNotification[];
  getNotificationsByType: (type: NotificationType) => AppNotification[];
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const stored = localStorage.getItem(`notifications_${userId}`);
      const notifications: AppNotification[] = stored ? JSON.parse(stored) : [];
      
      // Sort by creation date (newest first)
      notifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const unreadCount = notifications.filter(n => !n.read).length;
      
      set({ 
        notifications, 
        unreadCount, 
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to fetch notifications', isLoading: false });
    }
  },

  addNotification: (notificationData: Omit<AppNotification, 'id' | 'createdAt'>) => {
    const newNotification: AppNotification = {
      ...notificationData,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const { notifications } = get();
    const updatedNotifications = [newNotification, ...notifications];
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    
    // Save to localStorage
    localStorage.setItem(
      `notifications_${notificationData.userId}`, 
      JSON.stringify(updatedNotifications)
    );
    
    set({ 
      notifications: updatedNotifications, 
      unreadCount 
    });

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico',
        tag: newNotification.id,
      });
    }
  },

  markAsRead: (id: string) => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: true }
        : notification
    );
    
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    
    // Save to localStorage
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      localStorage.setItem(
        `notifications_${notification.userId}`, 
        JSON.stringify(updatedNotifications)
      );
    }
    
    set({ 
      notifications: updatedNotifications, 
      unreadCount 
    });
  },

  markAllAsRead: () => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true,
    }));
    
    // Save to localStorage
    if (notifications.length > 0) {
      localStorage.setItem(
        `notifications_${notifications[0].userId}`, 
        JSON.stringify(updatedNotifications)
      );
    }
    
    set({ 
      notifications: updatedNotifications, 
      unreadCount: 0 
    });
  },

  deleteNotification: (id: string) => {
    const { notifications } = get();
    const notification = notifications.find(n => n.id === id);
    const updatedNotifications = notifications.filter(n => n.id !== id);
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    
    // Save to localStorage
    if (notification) {
      localStorage.setItem(
        `notifications_${notification.userId}`, 
        JSON.stringify(updatedNotifications)
      );
    }
    
    set({ 
      notifications: updatedNotifications, 
      unreadCount 
    });
  },

  clearAllNotifications: () => {
    const { notifications } = get();
    
    // Clear from localStorage
    if (notifications.length > 0) {
      localStorage.removeItem(`notifications_${notifications[0].userId}`);
    }
    
    set({ 
      notifications: [], 
      unreadCount: 0 
    });
  },

  getUnreadNotifications: () => {
    const { notifications } = get();
    return notifications.filter(notification => !notification.read);
  },

  getNotificationsByType: (type: NotificationType) => {
    const { notifications } = get();
    return notifications.filter(notification => notification.type === type);
  },
}));