import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Page, BookingStatus, CustomerRelationship, Customer, Booking } from '../types';
import { NewBookingData } from '../dal/bookings';

export interface BookingFilters {
    status: BookingStatus | 'all';
    assignment: 'all' | 'unassigned' | 'assigned';
    searchQuery: string;
    bookingDate: string;
}

export interface CustomerFilters {
    searchQuery: string;
    relationship: CustomerRelationship | 'all';
    tag: string;
}

export interface StaffFilters {
    searchQuery: string;
}

export type AvailabilityCheckerMode = 'discovery' | 'form-assist' | 'direct-assign';
export interface AvailabilityCheckerContext {
    mode: AvailabilityCheckerMode;
    formData?: Partial<NewBookingData>;
    booking?: Booking;
    defaultTab?: 'staff' | 'teams';
}

interface UiState {
    activeView: Page;
    isCommandPaletteOpen: boolean;
    isSidebarCollapsed: boolean;

    // State for globally accessible "add" modals
    isAddBookingModalOpen: boolean;
    isAddCustomerModalOpen: boolean;
    isAddStaffModalOpen: boolean;
    isAddPackageModalOpen: boolean;
    isAddTeamModalOpen: boolean;
    
    // NEW state for the unified checker
    isGlobalAvailabilityCheckerOpen: boolean;
    availabilityCheckerContext: AvailabilityCheckerContext | null;
    onAvailabilityCheckerSuccess: ((result: Partial<NewBookingData>) => void) | null;
    onAvailabilityCheckerCancel: (() => void) | null;

    // Context for creating a new booking for a specific customer
    newBookingCustomerContext: Customer | null;
    newBookingInitialValues: Partial<NewBookingData> | null;
    
    bookingFilters: BookingFilters;
    customerFilters: CustomerFilters;
    staffFilters: StaffFilters;
    
    // Actions
    setActiveView: (view: Page) => void;
    toggleCommandPalette: () => void;
    closeCommandPalette: () => void;
    toggleSidebar: () => void;
    
    openGlobalAvailabilityChecker: (context: AvailabilityCheckerContext, onComplete?: (result: Partial<NewBookingData>) => void, onCancel?: () => void) => void;
    
    openAddBookingModal: (customer?: Customer | null, initialValues?: Partial<NewBookingData> | null) => void;
    openAddCustomerModal: () => void;
    openAddStaffModal: () => void;
    openAddPackageModal: () => void;
    openAddTeamModal: () => void;
    closeAllModals: () => void;
    
    setBookingFilters: (filters: Partial<BookingFilters>) => void;
    setCustomerFilters: (filters: Partial<CustomerFilters>) => void;
    setStaffFilters: (filters: Partial<StaffFilters>) => void;
    resetBookingFilters: () => void;
    resetCustomerFilters: () => void;
    resetStaffFilters: () => void;
}

const initialBookingFilters: BookingFilters = {
    status: 'all',
    assignment: 'all',
    searchQuery: '',
    bookingDate: '',
};

const initialCustomerFilters: CustomerFilters = {
    searchQuery: '',
    relationship: 'all',
    tag: '',
};

const initialStaffFilters: StaffFilters = {
    searchQuery: '',
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
        activeView: 'dashboard',
        isCommandPaletteOpen: false,
        isSidebarCollapsed: false,

        isAddBookingModalOpen: false,
        isAddCustomerModalOpen: false,
        isAddStaffModalOpen: false,
        isAddPackageModalOpen: false,
        isAddTeamModalOpen: false,
        
        isGlobalAvailabilityCheckerOpen: false,
        availabilityCheckerContext: null,
        onAvailabilityCheckerSuccess: null,
        onAvailabilityCheckerCancel: null,
        
        newBookingCustomerContext: null,
        newBookingInitialValues: null,
        
        bookingFilters: initialBookingFilters,
        customerFilters: initialCustomerFilters,
        staffFilters: initialStaffFilters,
        
        setActiveView: (view) => set({ activeView: view }),
        toggleCommandPalette: () => set(state => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
        closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
        toggleSidebar: () => set(state => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
        
        openGlobalAvailabilityChecker: (context, onComplete, onCancel) => set({ 
            isGlobalAvailabilityCheckerOpen: true,
            availabilityCheckerContext: context,
            onAvailabilityCheckerSuccess: onComplete || null,
            onAvailabilityCheckerCancel: onCancel || null,
        }),
        
        openAddBookingModal: (customer, initialValues) => set({
            isAddBookingModalOpen: true,
            newBookingCustomerContext: customer || null,
            newBookingInitialValues: initialValues || null,
        }),
        openAddCustomerModal: () => set({ isAddCustomerModalOpen: true }),
        openAddStaffModal: () => set({ isAddStaffModalOpen: true }),
        openAddPackageModal: () => set({ isAddPackageModalOpen: true }),
        openAddTeamModal: () => set({ isAddTeamModalOpen: true }),
        closeAllModals: () => set({
            isCommandPaletteOpen: false,
            isAddBookingModalOpen: false,
            isAddCustomerModalOpen: false,
            isAddStaffModalOpen: false,
            isAddPackageModalOpen: false,
            isAddTeamModalOpen: false,
            newBookingCustomerContext: null,
            newBookingInitialValues: null,
            isGlobalAvailabilityCheckerOpen: false,
            availabilityCheckerContext: null,
            onAvailabilityCheckerSuccess: null,
            onAvailabilityCheckerCancel: null,
        }),

        setBookingFilters: (filters) => set(state => ({ bookingFilters: { ...state.bookingFilters, ...filters }})),
        setCustomerFilters: (filters) => set(state => ({ customerFilters: { ...state.customerFilters, ...filters }})),
        setStaffFilters: (filters) => set(state => ({ staffFilters: { ...state.staffFilters, ...filters }})),
        resetBookingFilters: () => set({ bookingFilters: initialBookingFilters }),
        resetCustomerFilters: () => set({ customerFilters: initialCustomerFilters }),
        resetStaffFilters: () => set({ staffFilters: initialStaffFilters }),
    }),
    {
      name: 'tinedy-ui-storage',
      partialize: (state) => ({ isSidebarCollapsed: state.isSidebarCollapsed }),
    }
  )
);