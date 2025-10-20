import React, { useState, useEffect, useMemo } from 'react';
import { Package, Booking, Customer, StaffMember, Team } from '../../types';
import { NewBookingData, BookingUpdateData, NewBookingForExistingCustomerData } from '../../dal/bookings';
import { PlusIcon, XCircleIcon, CheckCircleIcon, QuestionMarkCircleIcon, UserIcon, UserGroupIcon } from '../ui/icons';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import Select from '../ui/Select';
import NativeDatePicker from '../ui/NativeDatePicker';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import { useStaffStore } from '../../store/staffStore';
import { useTeamStore } from '../../store/teamStore';

interface BookingFormProps {
  onSubmit: (booking: NewBookingData | NewBookingForExistingCustomerData | BookingUpdateData) => void;
  packages: Package[];
  customers: Customer[];
  staff: StaffMember[];
  onClose: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'info', title: string) => void;
  initialData?: Booking | null;
  initialValues?: Partial<NewBookingData> | null;
  initialCustomer?: Customer | null;
  onOpenAvailabilityChecker?: (data: Partial<NewBookingData>, options?: { defaultTab?: 'staff' | 'teams' }) => void;
}

interface BookingFormState {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    packageId: string;
    bookingDate: string;
    bookingTime: string;
    address: string;
    notes: string;
    assignedStaffId: string;
    assignedTeamId: string; // Added for team assignment
}

const validationSchema: ValidationSchema<BookingFormState> = {
    customerName: { required: 'Customer name is required.' },
    customerEmail: { 
        required: 'Email is required.',
        pattern: { value: /\S+@\S+\.\S+/, message: 'Please enter a valid email address.' }
    },
    customerPhone: {
        pattern: { value: /^[0-9-()\s+]*$/, message: 'Please enter a valid phone number.' }
    },
    packageId: { required: 'Please select a service package.' },
    bookingDate: { required: 'Booking date is required.' },
    bookingTime: { required: 'Booking time is required.' },
    address: { required: 'Service address is required.'},
};

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, packages, customers, staff, onClose, addToast, initialData, initialValues, initialCustomer, onOpenAvailabilityChecker }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerLocked, setIsCustomerLocked] = useState(false);
  const isEditMode = !!initialData;
  
  const allStaff = useStaffStore(state => state.staff);
  const allTeams = useTeamStore(state => state.teams);

  const initialFormState = useMemo((): BookingFormState => {
      const base = {
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          packageId: '',
          bookingDate: '',
          bookingTime: '',
          address: '',
          notes: '',
          assignedStaffId: '',
          assignedTeamId: '',
      };
  
      if (initialData) {
          return {
              ...base,
              customerName: initialData.customer.name,
              customerEmail: initialData.customer.email,
              customerPhone: initialData.customer.phone || '',
              packageId: initialData.packageId,
              bookingDate: initialData.bookingDate,
              bookingTime: initialData.bookingTime,
              address: initialData.address || '',
              notes: initialData.notes || '',
              assignedStaffId: initialData.assignedStaffId || '',
              assignedTeamId: initialData.assignedTeamId || '',
          };
      }
      
      const combinedInitial = { ...initialValues, ...initialCustomer };
      return {
          ...base,
          customerName: initialCustomer?.name || initialValues?.customerName || '',
          customerEmail: initialCustomer?.email || initialValues?.customerEmail || '',
          customerPhone: initialCustomer?.phone || initialValues?.customerPhone || '',
          packageId: initialValues?.packageId || '',
          bookingDate: initialValues?.bookingDate || '',
          bookingTime: initialValues?.bookingTime || '',
          address: initialValues?.address || '',
          notes: initialValues?.notes || '',
          assignedStaffId: initialValues?.assignedStaffId || '',
          assignedTeamId: initialValues?.assignedTeamId || '',
      };
  }, [initialData, initialValues, initialCustomer]);

  const { values, setValues, errors, validate, handleInputChange, handleValueChange, resetForm } = useFormValidation(initialFormState, validationSchema);
  
  // This effect listens to changes from the availability checker
  useEffect(() => {
    if (initialValues) {
        setValues(prev => ({...prev, ...initialValues}));
    }
  }, [initialValues]);

  const resetCustomerState = () => {
    setValues(prev => ({
        ...prev,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
    }));
    setSelectedCustomer(null);
    setIsCustomerLocked(false);
  };
  
  const handleOpenChecker = () => {
      if (onOpenAvailabilityChecker) {
          const options: { defaultTab?: 'staff' | 'teams' } = {};
          if (isEditMode && initialData) {
              if (initialData.assignedTeamId) {
                  options.defaultTab = 'teams';
              } else {
                  options.defaultTab = 'staff';
              }
          }
          onOpenAvailabilityChecker(values, options);
      }
  };

  useEffect(() => {
    if (initialData) {
        setSelectedCustomer(initialData.customer);
        setIsCustomerLocked(true);
    } else if (initialCustomer) {
        setSelectedCustomer(initialCustomer);
        setIsCustomerLocked(true);
    } else {
        setSelectedCustomer(null);
        setIsCustomerLocked(false);
    }
  }, [initialData, initialCustomer]);

  useEffect(() => {
    resetForm(initialFormState);
  }, [initialFormState, resetForm]);


  const handleFindCustomer = (value: string) => {
    if (!value || isCustomerLocked || isEditMode) return;
    
    const foundCustomer = customers.find(c => c.email.toLowerCase() === value.toLowerCase() || c.phone === value);
    
    if (foundCustomer) {
        setValues(prev => ({
            ...prev,
            customerName: foundCustomer.name,
            customerEmail: foundCustomer.email,
            customerPhone: foundCustomer.phone || '',
        }));
        setSelectedCustomer(foundCustomer);
        setIsCustomerLocked(true);
        addToast(`Existing customer "${foundCustomer.name}" has been selected.`, 'info', 'Customer Found');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const commonData = { 
        packageId: values.packageId, 
        bookingDate: values.bookingDate, 
        bookingTime: values.bookingTime, 
        address: values.address, 
        notes: values.notes,
        assignedStaffId: values.assignedStaffId || null,
        assignedTeamId: values.assignedTeamId || null,
    };

    if (isEditMode) {
        onSubmit(commonData);
    } else if (selectedCustomer) {
        onSubmit({ ...commonData, customerId: selectedCustomer.id });
    } else {
        onSubmit({
            ...commonData,
            customerName: values.customerName,
            customerEmail: values.customerEmail,
            customerPhone: values.customerPhone,
        });
    }
  };
  
  const packageOptions = packages.map(p => ({
    value: p.id,
    label: `${p.name} (฿${p.price.toLocaleString()})`
  }));
  
  const isCheckerReady = !!(values.bookingDate && values.bookingTime && values.packageId);

  const assignedStaff = useMemo(() => allStaff.find(s => s.id === values.assignedStaffId), [allStaff, values.assignedStaffId]);
  const assignedTeam = useMemo(() => allTeams.find(t => t.id === values.assignedTeamId), [allTeams, values.assignedTeamId]);

  const AssignmentDisplay = () => {
    const baseClasses = "w-full text-left px-3 py-2 border rounded-lg text-slate-900 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 flex items-center gap-2";
    if (assignedTeam) {
        return (
            <div className={baseClasses}>
                <UserGroupIcon className="w-5 h-5 text-tinedy-blue" />
                <span className="font-semibold">{assignedTeam.name}</span>
            </div>
        );
    }
    if (assignedStaff) {
        return (
            <div className={baseClasses}>
                <UserIcon className="w-5 h-5 text-tinedy-blue" />
                <span className="font-semibold">{assignedStaff.name}</span>
            </div>
        );
    }
    return (
        <div className={baseClasses}>
            <span className="text-slate-500 dark:text-slate-400 italic">Unassigned</span>
        </div>
    );
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Customer Information</h3>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-4">
              {isCustomerLocked && (
                  <div className="flex justify-between items-center bg-tinedy-green/10 text-tinedy-green p-3 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5"/>
                          <p className="font-semibold">Existing customer found and selected.</p>
                      </div>
                      {!isEditMode && !initialCustomer && (
                          <button type="button" onClick={resetCustomerState} className="flex items-center gap-1 text-sm font-semibold hover:underline">
                              <XCircleIcon className="w-4 h-4" />
                              Clear
                          </button>
                      )}
                  </div>
              )}
              <InputField id="customerName" label="Customer Name" type="text" value={values.customerName} onChange={handleInputChange('customerName')} error={errors.customerName} disabled={isCustomerLocked}/>
              <InputField id="customerEmail" label="Email" type="email" value={values.customerEmail} onChange={handleInputChange('customerEmail')} onBlur={e => handleFindCustomer(e.target.value)} error={errors.customerEmail} disabled={isCustomerLocked} />
              <InputField id="customerPhone" label="Phone (Optional)" type="tel" value={values.customerPhone} onChange={handleInputChange('customerPhone')} onBlur={e => handleFindCustomer(e.target.value)} error={errors.customerPhone} disabled={isCustomerLocked}/>
            </div>
        </div>
        
        <Select id="package" label="Service Package" value={values.packageId} onChange={(v) => handleValueChange('packageId', v)} options={packageOptions} error={errors.packageId} placeholder="Select a package" required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NativeDatePicker id="bookingDate" label="Date" value={values.bookingDate} onChange={(v) => handleValueChange('bookingDate', v)} error={errors.bookingDate} />
            <InputField id="bookingTime" label="Time" type="time" value={values.bookingTime} onChange={handleInputChange('bookingTime')} error={errors.bookingTime} />
        </div>
        <InputField as="textarea" id="address" label="Address" value={values.address} onChange={handleInputChange('address')} error={errors.address} rows={3} placeholder="123 Main St, Anytown, USA 12345" required />
        
        <div>
            <div className="flex justify-between items-center mb-1">
                 <label htmlFor="staff" className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                    Assignment (Optional)
                </label>
                 <button 
                    type="button"
                    onClick={handleOpenChecker}
                    disabled={!isCheckerReady || !onOpenAvailabilityChecker}
                    className="flex items-center gap-1 text-xs font-semibold text-tinedy-blue hover:underline disabled:text-slate-400 disabled:cursor-not-allowed disabled:no-underline"
                 >
                    <QuestionMarkCircleIcon className="w-4 h-4" />
                    Check / Change Availability
                </button>
            </div>
            <AssignmentDisplay />
        </div>
        
        <InputField as="textarea" id="notes" label="Notes (Optional)" value={values.notes} onChange={handleInputChange('notes')} rows={3} placeholder="Any special requests..." />

        <div className="flex justify-end gap-3 pt-2">
             <Button type="button" variant="secondary" onClick={onClose} className="font-semibold">Cancel</Button>
             <Button type="submit" className="font-bold">{isEditMode ? 'Save Changes' : <><PlusIcon className="w-5 h-5 mr-2" />Create Appointment</>}</Button>
        </div>
      </form>
  );
};

export default BookingForm;