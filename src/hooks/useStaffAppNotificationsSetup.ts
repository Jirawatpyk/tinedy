import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase, Database } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useStaffStore } from '../store/staffStore';
import { useTeamStore } from '../store/teamStore';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useBookingStore } from '../store/bookingStore';

export const useStaffAppNotificationsSetup = () => {
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();
    const addNotification = useNotificationStore((state) => state.addNotification);
    const staff = useStaffStore((state) => state.staff);
    const teams = useTeamStore((state) => state.teams);

    useEffect(() => {
        if (!supabase || !user) return;

        const handleBookingChange = (payload: RealtimePostgresChangesPayload<Database['public']['Tables']['bookings']['Row']>) => {
            const currentBookings = useBookingStore.getState().bookings;
            
            const newPayload = payload.new;
            if (payload.eventType !== 'UPDATE' || !('id' in newPayload)) return;

            const oldBooking = currentBookings.find(b => b.id === newPayload.id);
            if (!oldBooking) return;

            // Check for assignment notification
            if (oldBooking.assignedStaffId !== newPayload.assigned_staff_id && newPayload.assigned_staff_id === user.id) {
                addNotification(`คุณได้รับมอบหมายงานใหม่: #${newPayload.booking_number}`, 'ASSIGNMENT', { targetPage: 'bookings', targetId: newPayload.id });
            }

            // Check for team assignment notification
            const userTeamIds = teams.filter(t => t.members.some(m => m.id === user.id)).map(t => t.id);
            if (oldBooking.assignedTeamId !== newPayload.assigned_team_id && newPayload.assigned_team_id && userTeamIds.includes(newPayload.assigned_team_id)) {
                const teamName = teams.find(t => t.id === newPayload.assigned_team_id)?.name;
                addNotification(`ทีมของคุณ (${teamName}) ได้รับงานใหม่: #${newPayload.booking_number}`, 'ASSIGNMENT', { targetPage: 'bookings', targetId: newPayload.id });
            }

            // Check for status change notification
            if (oldBooking.status !== newPayload.status) {
                const isAssignedToUser = newPayload.assigned_staff_id === user.id || (newPayload.assigned_team_id && userTeamIds.includes(newPayload.assigned_team_id));
                if (isAssignedToUser) {
                    const type = newPayload.status === 'Cancelled' ? 'CANCELLATION' : 'STATUS_CHANGE';
                    addNotification(`สถานะงาน #${newPayload.booking_number} เปลี่ยนเป็น '${newPayload.status}'`, type, { targetPage: 'bookings', targetId: newPayload.id });
                }
            }

            queryClient.invalidateQueries({ queryKey: ['staffSchedule', user.id] });
        };

        const handleMessageChange = (payload: RealtimePostgresChangesPayload<Database['public']['Tables']['staff_messages']['Row']>) => {
             if (payload.eventType === 'INSERT' && 'recipient_id' in payload.new && payload.new.recipient_id === user.id) {
                const sender = staff.find(s => s.id === payload.new.sender_id);
                addNotification(`คุณมีข้อความใหม่จาก ${sender?.name || 'ผู้ดูแลระบบ'}`, 'MENTION'); // Re-using MENTION for messages
                queryClient.invalidateQueries({ queryKey: ['staffUnreadMessages', user.id] });
             }
        };

        const bookingsChannel = supabase.channel('staff-bookings-realtime')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, handleBookingChange)
            .subscribe();

        const messagesChannel = supabase.channel(`staff-messages-realtime-${user.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'staff_messages' }, handleMessageChange)
            .subscribe();

        return () => {
            supabase.removeChannel(bookingsChannel);
            supabase.removeChannel(messagesChannel);
        };

    }, [user, queryClient, addNotification, staff, teams]);
};
