import { useQuery } from '@tanstack/react-query';
import { getBookingsForStaff } from '../dal/bookings';
import { useAuthStore } from '../store/authStore';

export const useStaffSchedule = () => {
    const user = useAuthStore((state) => state.user);
    
    return useQuery({
        queryKey: ['staffSchedule', user?.id],
        queryFn: () => {
            if (!user?.id) {
                // This should not happen if enabled is working correctly, but as a safeguard.
                return Promise.resolve([]);
            }
            return getBookingsForStaff(user.id);
        },
        enabled: !!user?.id, // Only run the query if we have a user ID
    });
};
