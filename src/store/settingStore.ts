import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuditStorageMode = 'browser' | 'database';

interface SettingState {
  auditStorageMode: AuditStorageMode;
  setAuditStorageMode: (mode: AuditStorageMode) => void;
}

export const useSettingStore = create<SettingState>()(
  persist(
    (set) => ({
      auditStorageMode: 'browser', // Default to browser for existing users
      setAuditStorageMode: (mode) => set({ auditStorageMode: mode }),
    }),
    {
      name: 'tinedy-settings-storage',
    }
  )
);
