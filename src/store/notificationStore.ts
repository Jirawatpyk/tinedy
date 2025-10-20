import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppNotification, AppNotificationType, Page } from '../types';

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (message: string, type: AppNotificationType, targets?: { targetPage?: Page, targetId?: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      
      addNotification: (message, type, targets) => {
        const newNotification: AppNotification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: new Date().toISOString(),
          message,
          isRead: false,
          type,
          ...targets,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep max 50 notifications
        }));
      },
      
      markAsRead: (id) => {
        const notification = get().notifications.find(n => n.id === id);
        if (notification && !notification.isRead) {
          set((state) => ({
            notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
          }));
        }
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'tinedy-notification-storage',
    }
  )
);
