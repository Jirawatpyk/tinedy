import { create } from 'zustand';
import { StaffMember } from '../types';

interface StaffState {
    staff: StaffMember[];
    setStaff: (staff: StaffMember[]) => void;
    addStaff: (staffMember: StaffMember) => void;
    updateStaff: (staffMember: StaffMember) => void;
    removeStaff: (staffId: string) => void;
}

export const useStaffStore = create<StaffState>((set) => ({
    staff: [],
    setStaff: (staff) => set({ staff }),
    // FIX: Add addStaff action.
    addStaff: (staffMember) => set((state) => ({ staff: [...state.staff, staffMember] })),
    // FIX: Add updateStaff action.
    updateStaff: (staffMember) => set((state) => ({
        staff: state.staff.map(s => s.id === staffMember.id ? staffMember : s)
    })),
    // FIX: Add removeStaff action.
    removeStaff: (staffId) => set((state) => ({
        staff: state.staff.filter(s => s.id !== staffId)
    })),
}));
