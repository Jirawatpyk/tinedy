import { create } from 'zustand';
import { Customer } from '../types';

interface CustomerState {
    customers: Customer[];
    setCustomers: (customers: Customer[]) => void;
    addCustomer: (customer: Customer) => void;
    updateCustomer: (customer: Customer) => void;
    removeCustomer: (customerId: string) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
    customers: [],
    setCustomers: (customers) => set({ customers }),
    addCustomer: (customer) => set((state) => ({
        customers: state.customers.find(c => c.id === customer.id) ? state.customers : [...state.customers, customer]
    })),
    updateCustomer: (customer) => set((state) => ({
        customers: state.customers.map(c => c.id === customer.id ? customer : c)
    })),
    removeCustomer: (customerId) => set((state) => ({
        customers: state.customers.filter(c => c.id !== customerId)
    })),
}));
