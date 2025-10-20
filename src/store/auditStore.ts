import { create } from 'zustand';
import { AuditLog, AuditAction } from '../types';
import { persist } from 'zustand/middleware';
import { useSettingStore } from './settingStore';
import { addAuditLog as addDbAuditLog } from '../dal/audit';


interface AuditState {
  logs: AuditLog[];
  addLog: (userEmail: string, action: AuditAction, details: string, bookingId?: string) => Promise<void>;
}

// Function to generate a more realistic recent date
const getRecentISOString = (daysAgo: number, hoursAgo: number = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(date.getHours() - hoursAgo);
    return date.toISOString();
};


// Initial dummy data for demo purposes to make the page look populated
const INITIAL_LOGS: AuditLog[] = [
    { id: 'log-1', createdAt: getRecentISOString(0, 1), userEmail: 'admin@tinedy.com', action: 'UPDATE_STATUS', details: 'Changed status to Confirmed for booking #BK-1001.' },
    { id: 'log-2', createdAt: getRecentISOString(0, 2), userEmail: 'manager@tinedy.com', action: 'ASSIGN_STAFF', details: 'Assigned Jane Smith to booking #BK-1002.' },
    { id: 'log-3', createdAt: getRecentISOString(1, 4), userEmail: 'admin@tinedy.com', action: 'CREATE_CUSTOMER', details: 'Added new customer: Diana Miller.' },
    { id: 'log-4', createdAt: getRecentISOString(1, 5), userEmail: 'manager@tinedy.com', action: 'UPDATE_STAFF', details: 'Updated profile for staff member John Doe.' },
    { id: 'log-5', createdAt: getRecentISOString(2, 8), userEmail: 'admin@tinedy.com', action: 'CREATE_PACKAGE', details: 'Added new package: Weekend Warrior.' },
];


export const useAuditStore = create<AuditState>()(
    persist(
        (set) => ({
            logs: INITIAL_LOGS,
            addLog: async (userEmail, action, details, bookingId) => {
                const { auditStorageMode } = useSettingStore.getState();

                if (auditStorageMode === 'database') {
                    try {
                        await addDbAuditLog({ userEmail, action, details, bookingId });
                        // Log is saved to the database. The AuditLogPage will fetch directly.
                    } catch (error: any) {
                        const errorMessage = error.message ? `${error.message}${error.details ? ` (${error.details})` : ''}` : 'An unknown error occurred while saving the audit log.';
                        console.error("Failed to save audit log to database:", errorMessage, error);
                        // Fallback or error notification could be implemented here.
                    }
                } else { // 'browser' mode
                    const newLog: AuditLog = {
                        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                        createdAt: new Date().toISOString(),
                        userEmail,
                        action,
                        details,
                        bookingId,
                    };
                    set((state) => ({ logs: [newLog, ...state.logs] }));
                }
            },
        }),
        {
            name: 'tinedy-audit-storage', // Name of the item in localStorage
        }
    )
);