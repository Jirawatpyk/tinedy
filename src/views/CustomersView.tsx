import React, { useMemo, useEffect } from 'react';
import { Customer, StaffMember, Package, ToastType, BookingStatus, CustomerRelationship } from '../types';
import CustomersPage from '../components/customer/CustomersPage';
import { useCustomers, useAddCustomer, useUpdateCustomer, useDeleteCustomer, useBulkDeleteCustomers, useBulkUpdateCustomersRelationship } from '../hooks/useCustomers';
import { useCrudModals } from '../hooks/useCrudModals';
import { useBookingStore } from '../store/bookingStore';
import { usePackageStore } from '../store/packageStore';
import { useStaffStore } from '../store/staffStore';
import { useUiStore } from '../store/uiStore';
import Modal from '../components/ui/Modal';
import BookingHistoryList from '../components/customer/BookingHistoryList';
import DetailItem from '../components/ui/DetailItem';
import { UserCircleIcon, AtSymbolIcon, PhoneIcon, StarIcon, CurrencyDollarIcon, ListBulletIcon, ArchiveBoxIcon, BriefcaseIcon, ChatBubbleLeftEllipsisIcon, CheckBadgeIcon, PlusIcon, TagIcon, PaperAirplaneIcon, EnvelopeIcon } from '../components/ui/icons';
import { RELATIONSHIP_CONFIG } from '../constants';
import CustomerNotes from '../components/customer/CustomerNotes';
import Button from '../components/ui/Button';
import CustomerTags from '../components/customer/CustomerTags';


interface CustomersViewProps {
    addToast: (message: string, type: ToastType, title: string) => void;
}

// Enriched customer type with calculated stats, now defined here.
export type CustomerWithStats = Customer & {
    totalBookings: number;
    lastBookingDate: Date | null;
    lifetimeValue: number;
};

const CustomersView: React.FC<CustomersViewProps> = ({ addToast }) => {
    const { data: customers = [] } = useCustomers();
    const bookings = useBookingStore(state => state.bookings);
    const packages = usePackageStore(state => state.packages);
    const staff = useStaffStore(state => state.staff);
    const { viewingItem, handleOpenViewModal, handleCloseModals: handleCloseViewModal, handleCloseModals } = useCrudModals<CustomerWithStats>();

    // Global state for 'add' modal and view switching
    const { closeAllModals, setActiveView, openAddBookingModal } = useUiStore();

    const customersWithStats = useMemo((): CustomerWithStats[] => {
        // FIX: Explicitly type the Map to ensure correct type inference for 'pkg'.
        const packagesById = new Map<string, Package>(packages.map(p => [p.id, p]));
        return customers.map(customer => {
            const customerBookings = bookings.filter(b => b.customerId === customer.id);
            const completedBookings = customerBookings.filter(b => b.status === BookingStatus.Completed);
            
            const ltv = completedBookings.reduce((sum, booking) => {
                const pkg = packagesById.get(booking.packageId);
                return sum + (pkg?.price || 0);
            }, 0);

            const lastBooking = customerBookings.length > 0
                ? customerBookings.reduce((latest, current) => new Date(current.bookingDate) > new Date(latest.bookingDate) ? current : latest)
                : null;

            return {
                ...customer,
                totalBookings: customerBookings.length,
                lifetimeValue: ltv,
                lastBookingDate: lastBooking ? new Date(lastBooking.bookingDate) : null,
            };
        });
    }, [customers, bookings, packages]);

    // This effect ensures that if the data for the currently viewed customer changes
    // (e.g., after a note is saved), the modal's state is updated to reflect the new data.
    useEffect(() => {
        if (viewingItem) {
            const updatedCustomerInList = customersWithStats.find(c => c.id === viewingItem.id);
            // Compare with JSON.stringify to do a deep check and prevent infinite re-renders
            if (updatedCustomerInList && JSON.stringify(updatedCustomerInList) !== JSON.stringify(viewingItem)) {
                handleOpenViewModal(updatedCustomerInList);
            }
        }
    }, [customersWithStats, viewingItem, handleOpenViewModal]);


    const { mutate: addCustomer } = useAddCustomer({
        onSuccess: (newCustomer) => {
            addToast(`Customer "${newCustomer.name}" created successfully.`, 'success', 'Customer Added');
            closeAllModals();
        },
        onError: (error) => addToast(error.message, 'error', 'Error'),
    });

    const { mutate: updateCustomer } = useUpdateCustomer({
        onSuccess: (updatedCustomer) => addToast(`Customer "${updatedCustomer.name}" updated successfully.`, 'success', 'Customer Updated'),
        onError: (error) => addToast(error.message, 'error', 'Error'),
    });
    
    const { mutate: deleteCustomer } = useDeleteCustomer({
        onSuccess: (deletedCustomer) => addToast(`Customer "${deletedCustomer.name}" archived.`, 'success', 'Customer Archived'),
        onError: (error) => addToast(error.message, 'error', 'Error'),
    });
    
    const { mutate: bulkDeleteCustomers } = useBulkDeleteCustomers({
        onSuccess: (deleted) => addToast(`Archived ${deleted.length} customers.`, 'success', 'Bulk Archive'),
        onError: (error) => addToast(error.message, 'error', 'Error'),
    });

    const { mutate: bulkUpdateRelationship } = useBulkUpdateCustomersRelationship({
        onSuccess: (updated) => addToast(`Updated relationship for ${updated.length} customers.`, 'success', 'Bulk Update'),
        onError: (error) => addToast(error.message, 'error', 'Error'),
    });


    const handleAdd = (customerData: Omit<Customer, 'id' | 'createdAt' | 'tags'>) => {
        addCustomer(customerData);
    };

    const handleUpdate = (customerData: Customer) => {
        updateCustomer(customerData);
    };

    const handleDelete = (id: string) => {
        const customerToDelete = customers.find(c => c.id === id);
        if (customerToDelete) {
            deleteCustomer(customerToDelete);
        }
    };
    
    const handleBulkDelete = (selected: Customer[]) => {
        bulkDeleteCustomers(selected);
    };

    const handleBulkUpdateRelationship = (ids: string[], relationship: CustomerRelationship) => {
        bulkUpdateRelationship({ ids, relationship });
    };

    const handleCreateBookingForCustomer = () => {
        if (!viewingItem) return;
        handleCloseViewModal(); // Close the customer detail modal
        setActiveView('bookings');
        openAddBookingModal(viewingItem); // Open the booking modal with customer context
    };
    
    const handleSwitchToView = (customerToView: Customer) => {
        const customerWithStatsToView = customersWithStats.find(c => c.id === customerToView.id);
        if (customerWithStatsToView) {
            closeAllModals(); // Close 'add' modal
            handleCloseModals(); // Close any other local modals
            handleOpenViewModal(customerWithStatsToView);
        }
    };
    
    const customerBookings = viewingItem ? bookings.filter(b => b.customerId === viewingItem.id) : [];
    const relationshipConfig = viewingItem ? RELATIONSHIP_CONFIG[viewingItem.relationship] : null;
    const preferredStaffName = useMemo(() => {
        if (!viewingItem?.preferredStaffId) return 'N/A';
        return staff.find(s => s.id === viewingItem.preferredStaffId)?.name || 'Unknown';
    }, [viewingItem, staff]);
    
    const favoritePackageName = useMemo(() => {
        if (!viewingItem) return null;
        const customerBookings = bookings.filter(b => b.customerId === viewingItem.id);
        if (customerBookings.length === 0) return 'N/A';
        
        const packageCounts = customerBookings.reduce((acc, booking) => {
            acc[booking.packageId] = (acc[booking.packageId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        if (Object.keys(packageCounts).length === 0) return 'N/A';

        const favoritePackageId = Object.keys(packageCounts).reduce((a, b) => packageCounts[a] > packageCounts[b] ? a : b);
        
        return packages.find(p => p.id === favoritePackageId)?.name || 'Unknown';
    }, [viewingItem, bookings, packages]);


    return (
        <>
            <CustomersPage
                customersWithStats={customersWithStats}
                onAddCustomer={handleAdd}
                onUpdateCustomer={handleUpdate}
                onDeleteCustomer={handleDelete}
                onViewDetails={handleOpenViewModal}
                onBulkDelete={handleBulkDelete}
                onBulkUpdateRelationship={handleBulkUpdateRelationship}
                onSwitchToView={handleSwitchToView}
            />

            {viewingItem && (
                 <Modal 
                    isOpen={!!viewingItem} 
                    onClose={handleCloseViewModal} 
                    title="Customer 360° View"
                    size="4xl"
                >
                    <div className="space-y-6">
                        {/* Customer Profile Header */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3">
                                        {viewingItem.name}
                                        {relationshipConfig && (
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${relationshipConfig.color}`}>
                                                {relationshipConfig.label}
                                            </span>
                                        )}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mt-2">
                                        <div className="flex items-center gap-2">
                                            <AtSymbolIcon className="w-4 h-4 text-slate-400" />
                                            <a href={`mailto:${viewingItem.email}`} onClick={e => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-300 hover:underline hover:text-tinedy-blue">
                                                {viewingItem.email}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <PhoneIcon className="w-4 h-4 text-slate-400" />
                                            {viewingItem.phone ? (
                                                <a href={`tel:${viewingItem.phone}`} onClick={e => e.stopPropagation()} className="text-slate-600 dark:text-slate-300 hover:underline hover:text-tinedy-blue">
                                                    {viewingItem.phone}
                                                </a>
                                            ) : (
                                                <span className="text-slate-500 dark:text-slate-400">N/A</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-600 dark:text-slate-300">{viewingItem.lineId || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={handleCreateBookingForCustomer} className="flex-shrink-0">
                                    <PlusIcon className="w-5 h-5 mr-2" />
                                    New Booking
                                </Button>
                            </div>
                        </div>
                        
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
                             <DetailItem label="Lifetime Value" icon={<CurrencyDollarIcon className="w-4 h-4 text-slate-500" />}>
                                <p className="text-xl font-bold">฿{viewingItem.lifetimeValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            </DetailItem>
                             <DetailItem label="Total Bookings" icon={<ListBulletIcon className="w-4 h-4 text-slate-500" />}>
                                <p className="text-xl font-bold">{viewingItem.totalBookings}</p>
                            </DetailItem>
                             <DetailItem label="Favorite Package" icon={<ArchiveBoxIcon className="w-4 h-4 text-slate-500" />}>
                                <p className="text-lg font-bold truncate">{favoritePackageName}</p>
                            </DetailItem>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-y-8 lg:gap-x-8">
                            {/* Left Column (Wider) - Booking History */}
                            <div className="lg:col-span-3">
                                <BookingHistoryList 
                                    bookings={customerBookings}
                                    packages={packages}
                                    staff={staff}
                                />
                            </div>
                            
                            {/* Right Column (Narrower) - Preferences & Notes */}
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Preferences</h3>
                                     <div className="space-y-4">
                                        <DetailItem label="Preferred Contact Method" icon={<CheckBadgeIcon className="w-4 h-4 text-slate-500" />}>
                                            <p className="text-base font-semibold">{viewingItem.preferredContactMethod || 'Not Set'}</p>
                                        </DetailItem>
                                        <DetailItem label="Preferred Staff" icon={<BriefcaseIcon className="w-4 h-4 text-slate-500" />}>
                                            <p className="text-base font-semibold">{preferredStaffName}</p>
                                        </DetailItem>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                        <TagIcon className="w-5 h-5 text-slate-400" />
                                        Tags
                                    </h3>
                                    <CustomerTags 
                                        customer={viewingItem}
                                        addToast={addToast}
                                    />
                                </div>

                                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Notes</h3>
                                    <CustomerNotes customer={viewingItem} addToast={addToast} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default CustomersView;