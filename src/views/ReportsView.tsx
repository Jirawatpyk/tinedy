import React from 'react';
import { useBookingStore } from '../store/bookingStore';
import { useStaffStore } from '../store/staffStore';
import { usePackageStore } from '../store/packageStore';
import ReportsPage from '../components/reports/ReportsPage';
import { useTeamStore } from '../store/teamStore';

const ReportsView: React.FC = () => {
    const bookings = useBookingStore(state => state.bookings);
    const staff = useStaffStore(state => state.staff);
    const packages = usePackageStore(state => state.packages);
    const teams = useTeamStore(state => state.teams);

    return (
        <ReportsPage 
            bookings={bookings}
            staff={staff}
            packages={packages}
            teams={teams}
        />
    );
};

export default ReportsView;