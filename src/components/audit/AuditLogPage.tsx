import React, { useState, useEffect } from 'react';
import { useAuditStore } from '../../store/auditStore';
import { useSettingStore, AuditStorageMode } from '../../store/settingStore';
import { getAuditLogs } from '../../dal/audit';
import { AuditLog, AuditAction } from '../../types';
import Pagination from '../ui/Pagination';
import Switch from '../ui/Switch';
import Loader from '../ui/Loader';
import { QueueListIcon, PlusIcon, PencilIcon, TrashIcon, UserIcon, CheckCircleIcon, BriefcaseIcon, BellIcon, ArrowRightStartOnRectangleIcon, ChatBubbleLeftEllipsisIcon, ExclamationTriangleIcon, XMarkIcon } from '../ui/icons';
import Card from '../ui/Card';

const LOGS_PER_PAGE = 10;

const ActionIcon: React.FC<{ action: AuditAction }> = ({ action }) => {
    const iconMap: Record<AuditAction, { icon: React.ElementType; color: string }> = {
        'CREATE_BOOKING': { icon: PlusIcon, color: 'text-tinedy-green' },
        'UPDATE_BOOKING': { icon: PencilIcon, color: 'text-tinedy-yellow' },
        'UPDATE_STATUS': { icon: CheckCircleIcon, color: 'text-tinedy-blue' },
        'DELETE_BOOKING': { icon: TrashIcon, color: 'text-red-500' },
        'ASSIGN_STAFF': { icon: BriefcaseIcon, color: 'text-slate-500' },
        'OVERRIDE_ASSIGNMENT': { icon: ExclamationTriangleIcon, color: 'text-amber-500' },
        'SEND_REMINDER': { icon: BellIcon, color: 'text-tinedy-blue' },
        'CREATE_CUSTOMER': { icon: PlusIcon, color: 'text-tinedy-green' },
        'UPDATE_CUSTOMER': { icon: PencilIcon, color: 'text-tinedy-yellow' },
        'DELETE_CUSTOMER': { icon: TrashIcon, color: 'text-red-500' },
        'CREATE_STAFF': { icon: PlusIcon, color: 'text-tinedy-green' },
        'UPDATE_STAFF': { icon: PencilIcon, color: 'text-tinedy-yellow' },
        'DELETE_STAFF': { icon: TrashIcon, color: 'text-red-500' },
        'CREATE_PACKAGE': { icon: PlusIcon, color: 'text-tinedy-green' },
        'UPDATE_PACKAGE': { icon: PencilIcon, color: 'text-tinedy-yellow' },
        'DELETE_PACKAGE': { icon: TrashIcon, color: 'text-red-500' },
        'USER_LOGIN': { icon: ArrowRightStartOnRectangleIcon, color: 'text-slate-500' },
        'POST_COMMENT': { icon: ChatBubbleLeftEllipsisIcon, color: 'text-tinedy-blue' },
        'DELETE_COMMENT': { icon: TrashIcon, color: 'text-red-500' },
    };

    const { icon: Icon, color } = iconMap[action] || { icon: UserIcon, color: 'text-slate-400' };

    return <Icon className={`w-5 h-5 ${color}`} />;
};


const AuditLogItem: React.FC<{ log: AuditLog }> = ({ log }) => {
    
    const formatTimestamp = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    };

    return (
        <div className="flex items-start gap-4 p-3 border-b border-slate-100">
            <div className="flex-shrink-0 pt-1">
                <ActionIcon action={log.action} />
            </div>
            <div className="flex-grow">
                <p className="text-sm text-slate-800">{log.details}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>{formatTimestamp(log.createdAt)}</span>
                    <span className="flex items-center gap-1.5">
                        <UserIcon className="w-3 h-3" />
                        {log.userEmail}
                    </span>
                </div>
            </div>
        </div>
    );
};

const AuditLogPage: React.FC = () => {
    const browserLogs = useAuditStore((state) => state.logs);
    const { auditStorageMode, setAuditStorageMode } = useSettingStore();
    
    const [dbLogs, setDbLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showInfoBox, setShowInfoBox] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (auditStorageMode === 'database') {
            setIsLoading(true);
            setError(null);
            getAuditLogs()
                .then(setDbLogs)
                .catch(err => {
                    console.error(err);
                    setError("Failed to load audit logs from the database. You may not have the required permissions.");
                })
                .finally(() => setIsLoading(false));
        }
        // Reset page number when switching modes
        setCurrentPage(1);
    }, [auditStorageMode]);

    const logs = auditStorageMode === 'database' ? dbLogs : browserLogs;

    const totalPages = Math.ceil(logs.length / LOGS_PER_PAGE);
    const paginatedLogs = logs.slice(
        (currentPage - 1) * LOGS_PER_PAGE,
        currentPage * LOGS_PER_PAGE
    );

    return (
        <Card>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-tinedy-blue/20 p-2 rounded-lg">
                        <QueueListIcon className="w-6 h-6 text-tinedy-blue" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Audit Log</h2>
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1 text-right">Log Storage</label>
                    <Switch 
                        id="storage-switch"
                        checked={auditStorageMode === 'database'}
                        onChange={(checked) => setAuditStorageMode(checked ? 'database' : 'browser')}
                        offLabel="Browser"
                        onLabel="Database"
                    />
                </div>
            </div>
            
            {showInfoBox && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6 flex items-start gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-grow">
                        <p className="text-sm text-amber-800">
                            <strong>Browser</strong> storage is temporary and private to this device. <strong>Database</strong> storage is permanent and shared across the organization (admins/managers only).
                        </p>
                    </div>
                    <button onClick={() => setShowInfoBox(false)} className="p-1 text-amber-500 hover:bg-amber-200 rounded-full transition-colors" aria-label="Dismiss">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            )}


            {isLoading ? (
                <div className="py-12"><Loader /></div>
            ) : error ? (
                <div className="text-center py-12 text-red-600 bg-red-50 p-4 rounded-lg">
                    <p className="font-bold">Error Loading Logs</p>
                    <p>{error}</p>
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-slate-500">No activity has been recorded in '{auditStorageMode}' storage yet.</p>
                </div>
            ) : (
                <>
                    <div>
                        {paginatedLogs.map(log => (
                            <AuditLogItem key={log.id} log={log} />
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={LOGS_PER_PAGE}
                        totalItems={logs.length}
                    />
                </>
            )}
        </Card>
    );
};

export default AuditLogPage;