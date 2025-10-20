import React from 'react';
import { useBookingStore } from '../store/bookingStore';
import { useCustomerStore } from '../store/customerStore';
import { usePackageStore } from '../store/packageStore';
import { useUiStore } from '../store/uiStore';
import DashboardPage from '../components/dashboard/DashboardPage';

const DashboardView: React.FC = () => {
    const bookings = useBookingStore(state => state.bookings);
    const customers = useCustomerStore(state => state.customers);
    const packages = usePackageStore(state => state.packages);
    const setActiveView = useUiStore(state => state.setActiveView);
    const setBookingFilters = useUiStore(state => state.setBookingFilters);

    const handleMetricClick = (metric: 'unassigned') => {
        if (metric === 'unassigned') {
            setBookingFilters({ assignment: 'unassigned', status: 'all' });
            setActiveView('bookings');
        }
    };

    return (
        <DashboardPage 
            bookings={bookings}
            customers={customers}
            packages={packages}
            onMetricClick={handleMetricClick}
        />
    );
};

export default DashboardView;