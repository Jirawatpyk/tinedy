import React, { useState, useMemo, useEffect } from 'react';
import { Customer, CustomerRelationship } from '../../types';
import { CustomerWithStats } from '../../views/CustomersView';
import { UsersIcon, PlusIcon, ChevronDownIcon, ChevronUpIcon, ChevronUpDownIcon } from '../ui/icons';
import Pagination from '../ui/Pagination';
import Modal from '../ui/Modal';
import ConfirmationModal from '../ui/ConfirmationModal';
import CustomerForm from './CustomerForm';
import CustomerItem from './CustomerItem';
import Button from '../ui/Button';
import { Table, TableHeaderCell } from '../ui/Table';
import { useUiStore } from '../../store/uiStore';
import { useCrudModals } from '../../hooks/useCrudModals';
import SearchInput from '../ui/SearchInput';
import Select from '../ui/Select';
import { useTableSort, SortConfig } from '../../hooks/useTableSort';
import CustomerBulkActions from './CustomerBulkActions';
import Checkbox from '../ui/Checkbox';

interface CustomersPageProps {
  customersWithStats: CustomerWithStats[];
  onAddCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'notes' | 'tags'>) => void;
  onUpdateCustomer: (customerData: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onViewDetails: (customer: CustomerWithStats) => void;
  onBulkDelete: (selected: Customer[]) => void;
  onBulkUpdateRelationship: (ids: string[], relationship: CustomerRelationship) => void;
  onSwitchToView: (customer: Customer) => void;
}

const CUSTOMERS_PER_PAGE = 10;

const SortableHeader: React.FC<{
  sortKey: keyof CustomerWithStats;
  sortConfig: SortConfig<CustomerWithStats> | null;
  onRequestSort: (key: keyof CustomerWithStats) => void;
  className?: string;
  children: React.ReactNode;
}> = ({ sortKey, sortConfig, onRequestSort, className, children }) => {
    const isSorted = sortConfig?.key === sortKey;
    const direction = isSorted ? sortConfig?.direction : undefined;
    
    return (
        <TableHeaderCell className={`cursor-pointer ${className}`} onClick={() => onRequestSort(sortKey)}>
            <div className="flex items-center gap-1.5 group hover:text-slate-800 dark:hover:text-slate-200">
                <span>{children}</span>
                {isSorted ? (
                    direction === 'asc' ? <ChevronUpIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" /> : <ChevronDownIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                ) : (
                    <ChevronUpDownIcon className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
            </div>
        </TableHeaderCell>
    );
};


const CustomersPage: React.FC<CustomersPageProps> = ({ 
    customersWithStats, 
    onAddCustomer, 
    onUpdateCustomer, 
    onDeleteCustomer,
    onViewDetails,
    onBulkDelete,
    onBulkUpdateRelationship,
    onSwitchToView,
}) => {
    const { customerFilters, setCustomerFilters } = useUiStore();
    const { isAddCustomerModalOpen, openAddCustomerModal, closeAllModals } = useUiStore();
    const { searchQuery, relationship, tag } = customerFilters;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const { editingItem: editingCustomer, deletingItem: deletingCustomer, handleOpenEditModal, handleOpenDeleteModal, handleCloseModals } = useCrudModals<Customer>();

    const { sortedItems: sortedCustomers, requestSort, sortConfig } = useTableSort(customersWithStats, { key: 'name', direction: 'asc' });

    const filteredCustomers = useMemo(() => {
        return sortedCustomers.filter(customer => {
            const searchLower = searchQuery.toLowerCase();
            const relationshipMatch = relationship === 'all' || customer.relationship === relationship;
            
            const tagLower = tag.toLowerCase();
            const tagMatch = !tag || (customer.tags && customer.tags.some(t => t.name.toLowerCase().includes(tagLower)));
            
            const searchMatch = !searchQuery || 
                customer.name.toLowerCase().includes(searchLower) || 
                customer.email.toLowerCase().includes(searchLower) ||
                (customer.notes && customer.notes.toLowerCase().includes(searchLower));

            return searchMatch && relationshipMatch && tagMatch;
        });
    }, [sortedCustomers, searchQuery, relationship, tag]);
    
    useEffect(() => {
        setCurrentPage(1);
        setSelectedCustomers([]);
    }, [searchQuery, relationship, tag]);

    const totalPages = Math.ceil(filteredCustomers.length / CUSTOMERS_PER_PAGE);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * CUSTOMERS_PER_PAGE,
        currentPage * CUSTOMERS_PER_PAGE
    );
    
    const paginatedIds = useMemo(() => paginatedCustomers.map(c => c.id), [paginatedCustomers]);
    const isAllSelected = useMemo(() => {
        return paginatedIds.length > 0 && paginatedIds.every(id => selectedCustomers.includes(id));
    }, [selectedCustomers, paginatedIds]);

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedCustomers(prev => prev.filter(id => !paginatedIds.includes(id)));
        } else {
            setSelectedCustomers(prev => [...new Set([...prev, ...paginatedIds])]);
        }
    };
    
    const handleCustomerSelect = (customerId: string) => {
        setSelectedCustomers(prev =>
            prev.includes(customerId)
                ? prev.filter(id => id !== customerId)
                : [...prev, customerId]
        );
    };

    const handleSubmit = (customerData: Omit<Customer, 'id' | 'createdAt' | 'notes' | 'tags'> | Customer) => {
        if (editingCustomer) {
            onUpdateCustomer(customerData as Customer);
            handleCloseModals();
        } else {
            onAddCustomer(customerData as Omit<Customer, 'id' | 'createdAt' | 'notes' | 'tags'>);
        }
    };
  
    const handleDeleteConfirm = () => {
        if (deletingCustomer) {
            onDeleteCustomer(deletingCustomer.id);
            handleCloseModals();
        }
    };

    const handleBulkDeleteConfirm = () => {
        const customersToDelete = customersWithStats.filter(c => selectedCustomers.includes(c.id));
        onBulkDelete(customersToDelete);
        setSelectedCustomers([]);
    };
    
    const handleBulkUpdateRelationshipConfirm = (rel: CustomerRelationship) => {
        onBulkUpdateRelationship(selectedCustomers, rel);
        setSelectedCustomers([]);
    };

    const relationshipOptions = [
        { value: 'all', label: 'All Relationships' },
        ...Object.values(CustomerRelationship).map(r => ({ value: r, label: r }))
    ];
    
    const hasActiveSearch = searchQuery.trim().length > 0 || relationship !== 'all' || tag.trim().length > 0;
  
    const isFormModalOpen = isAddCustomerModalOpen || !!editingCustomer;
    const formModalTitle = editingCustomer ? "Edit Customer" : "Add New Customer";

    return (
        <>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg shadow-slate-200/40 dark:shadow-none dark:border dark:border-slate-800 flex flex-col flex-grow min-h-0">
                <div className="flex justify-between items-center mb-5 pb-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <UsersIcon className="w-8 h-8 text-slate-500 dark:text-slate-400"/>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Customers</h2>
                    </div>
                    <Button onClick={openAddCustomerModal} className="flex-shrink-0">
                      <PlusIcon className="w-5 h-5 sm:mr-2" />
                      <span className="hidden sm:inline">Add Customer</span>
                    </Button>
                </div>

                <div className="mb-6">
                    <div className="lg:hidden p-2 -mx-2 flex justify-between items-center" onClick={() => setIsMobileFiltersOpen(prev => !prev)}>
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">Filters</h3>
                        <button 
                            aria-expanded={isMobileFiltersOpen}
                            aria-controls="customer-filter-content"
                            className="p-1 -m-1"
                        >
                          {isMobileFiltersOpen ? <ChevronUpIcon className="w-5 h-5 text-slate-500" /> : <ChevronDownIcon className="w-5 h-5 text-slate-500" />}
                        </button>
                    </div>
      
                    <div 
                        id="customer-filter-content" 
                        className={`${isMobileFiltersOpen ? 'block pt-4 animate-fade-in-up' : 'hidden'} lg:block`}
                        style={{animationDuration: '200ms'}}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-2">
                              <SearchInput
                                id="search-customers"
                                placeholder="Search by name, email, or notes..."
                                value={searchQuery}
                                onChange={(val) => setCustomerFilters({ searchQuery: val })}
                              />
                            </div>
                            <Select
                                id="relationship-filter"
                                label=""
                                value={relationship}
                                onChange={(val) => setCustomerFilters({ relationship: val as CustomerRelationship | 'all' })}
                                options={relationshipOptions}
                            />
                            <SearchInput
                                id="search-tags"
                                placeholder="Filter by tag..."
                                value={tag}
                                onChange={(val) => setCustomerFilters({ tag: val })}
                             />
                        </div>
                    </div>
                </div>
                
                {selectedCustomers.length > 0 && (
                    <CustomerBulkActions
                        selectedCount={selectedCustomers.length}
                        onDelete={handleBulkDeleteConfirm}
                        onUpdateRelationship={handleBulkUpdateRelationshipConfirm}
                    />
                )}
                
                <div className="overflow-y-auto flex-grow -mx-6 px-6">
                    <Table aria-label="Customers List">
                        <Table.Header isSticky>
                            <TableHeaderCell className="flex-none w-16"><Checkbox checked={isAllSelected} onChange={handleSelectAll} aria-label="Select all customers on page"/></TableHeaderCell>
                            <SortableHeader sortKey="name" sortConfig={sortConfig} onRequestSort={requestSort} className="flex-1 md:basis-4/12 min-w-0">Customer</SortableHeader>
                            <SortableHeader sortKey="relationship" sortConfig={sortConfig} onRequestSort={requestSort} className="basis-3/12 hidden md:block grow-0">Relationship</SortableHeader>
                            <SortableHeader sortKey="lifetimeValue" sortConfig={sortConfig} onRequestSort={requestSort} className="basis-3/12 hidden lg:block grow-0">Lifetime Value</SortableHeader>
                            <SortableHeader sortKey="lastBookingDate" sortConfig={sortConfig} onRequestSort={requestSort} className="basis-2/12 hidden lg:block grow-0">Last Booking</SortableHeader>
                            <TableHeaderCell className="basis-[120px] shrink-0 grow-0 flex justify-end">Actions</TableHeaderCell>
                        </Table.Header>
                        <Table.Body>
                            {paginatedCustomers.map(customer => (
                                <CustomerItem
                                    key={customer.id}
                                    customer={customer}
                                    onViewDetails={onViewDetails}
                                    onEdit={handleOpenEditModal}
                                    onDelete={handleOpenDeleteModal}
                                    isSelected={selectedCustomers.includes(customer.id)}
                                    onSelect={handleCustomerSelect}
                                />
                            ))}
                        </Table.Body>
                    </Table>
                    
                    {paginatedCustomers.length === 0 && (
                        <Table.EmptyState
                            icon={UsersIcon}
                            title={hasActiveSearch ? `No customers found` : "No customers yet"}
                            message={hasActiveSearch ? "Try adjusting your search or filter." : "Get started by adding your first customer."}
                            action={!hasActiveSearch ? <Button onClick={openAddCustomerModal}><PlusIcon className="w-5 h-5 mr-2" />Add Customer</Button> : null}
                        />
                    )}
                </div>
    
                {filteredCustomers.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={CUSTOMERS_PER_PAGE}
                        totalItems={filteredCustomers.length}
                    />
                )}
            </div>
            
            <Modal isOpen={isFormModalOpen} onClose={editingCustomer ? handleCloseModals : closeAllModals} title={formModalTitle}>
              <CustomerForm 
                initialData={editingCustomer} 
                onSubmit={handleSubmit} 
                onClose={editingCustomer ? handleCloseModals : closeAllModals} 
                onSwitchToView={onSwitchToView}
              />
            </Modal>
    
            {deletingCustomer && (
               <ConfirmationModal
                  isOpen={!!deletingCustomer}
                  onClose={handleCloseModals}
                  onConfirm={handleDeleteConfirm}
                  title="Archive Customer"
                  message={
                      <p>Are you sure you want to archive <strong>{deletingCustomer.name}</strong>? Associated bookings may also be affected. This action cannot be undone.</p>
                  }
                  confirmButtonText="Archive"
                  confirmButtonVariant="danger"
               />
            )}
        </>
    );
};

export default CustomersPage;