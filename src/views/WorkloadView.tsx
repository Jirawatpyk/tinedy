import React from 'react';
import { useBookingStore } from '../store/bookingStore';
import { useStaffStore } from '../store/staffStore';
import { usePackageStore } from '../store/packageStore';
import WorkloadPage from '../components/workload/WorkloadPage';
import { useTeamStore } from '../store/teamStore';

const WorkloadView: React.FC = () => {
    const bookings = useBookingStore(state => state.bookings);
    const staff = useStaffStore(state => state.staff);
    const packages = usePackageStore(state => state.packages);
    const teams = useTeamStore(state => state.teams);
    
    return (
        <WorkloadPage 
            allBookings={bookings}
            staff={staff}
            packages={packages}
            allTeams={teams}
        />
    );
};

export default WorkloadView;
