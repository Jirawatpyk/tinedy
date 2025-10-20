import React from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationItem from '../../components/staff/NotificationItem';
import { BellIcon } from '../../components/ui/icons';

const StaffNotificationsView: React.FC = () => {
    const { notifications } = useNotificationStore();

    // Show most recent notifications first
    const sortedNotifications = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="p-4 sm:p-6 h-full flex flex-col">
            <header className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-display">
                    การแจ้งเตือน
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-rule">
                    รายการอัปเดตล่าสุดเกี่ยวกับงานและกิจกรรมของคุณ
                </p>
            </header>
            
            <div className="flex-grow overflow-y-auto -mx-4 px-4">
                {sortedNotifications.length > 0 ? (
                    <div className="space-y-3">
                        {sortedNotifications.map(notification => (
                            <NotificationItem key={notification.id} notification={notification} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full items-center justify-center text-center text-slate-500 dark:text-slate-400">
                        <BellIcon className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                        <p className="mt-4 font-semibold text-lg font-rule">ไม่มีการแจ้งเตือน</p>
                        <p className="mt-1 text-sm font-rule">ทุกอย่างเป็นปัจจุบันแล้ว</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffNotificationsView;
