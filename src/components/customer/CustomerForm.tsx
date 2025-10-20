import React, { useEffect, useMemo, useState } from 'react';
import { Customer, CustomerRelationship } from '../../types';
import { ExclamationTriangleIcon, PlusIcon } from '../ui/icons';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import Select from '../ui/Select';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import { useStaffStore } from '../../store/staffStore';
import { useDebounce } from '../../hooks/useDebounce';
import { findCustomerByEmailOrPhoneExcludingId } from '../../dal/customers';

interface CustomerFormProps {
    onSubmit: (customerData: Omit<Customer, 'id' | 'createdAt' | 'notes' | 'tags'> | Customer) => void;
    onClose: () => void;
    initialData?: Customer | null;
    onSwitchToView?: (customer: Customer) => void;
}

interface CustomerFormState {
    name: string;
    email: string;
    phone: string;
    relationship: CustomerRelationship;
    preferredStaffId: string;
    lineId: string;
    preferredContactMethod: 'Email' | 'Phone' | 'Line' | '';
}

const customerValidationSchema: ValidationSchema<CustomerFormState> = {
    name: {
        required: 'Name is required.',
        minLength: { value: 2, message: 'Name must be at least 2 characters long.' }
    },
    email: {
        required: 'Email is required.',
        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email address.' }
    },
    phone: {
        pattern: { value: /^[0-9-()\s+]*$/, message: 'Please enter a valid phone number.' }
    },
    relationship: {
        required: 'Relationship level is required.'
    }
};

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, onClose, initialData, onSwitchToView }) => {
    const isEditMode = !!initialData;
    const staff = useStaffStore(state => state.staff);

    const initialFormState = useMemo(() => ({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        relationship: initialData?.relationship || CustomerRelationship.New,
        preferredStaffId: initialData?.preferredStaffId || '',
        lineId: initialData?.lineId || '',
        preferredContactMethod: initialData?.preferredContactMethod || '' as '',
    }), [initialData]);
    
    const { values, errors, validate, handleInputChange, handleValueChange, resetForm } = useFormValidation<CustomerFormState>(
        initialFormState,
        customerValidationSchema
    );
    
    const [duplicateCustomer, setDuplicateCustomer] = useState<Customer | null>(null);
    const debouncedEmail = useDebounce(values.email, 500);
    const debouncedPhone = useDebounce(values.phone, 500);

    useEffect(() => {
        resetForm(initialFormState);
    }, [initialFormState, resetForm]);

    useEffect(() => {
        const checkDuplicate = async () => {
            const trimmedEmail = debouncedEmail.trim();
            const trimmedPhone = debouncedPhone.trim();

            if (!trimmedEmail && !trimmedPhone) {
                setDuplicateCustomer(null);
                return;
            }

            try {
                const potentialDuplicate = await findCustomerByEmailOrPhoneExcludingId(
                    { email: trimmedEmail, phone: trimmedPhone },
                    initialData?.id
                );
                setDuplicateCustomer(potentialDuplicate);
            } catch (error) {
                console.error("Failed to check for duplicate customer:", error);
            }
        };

        checkDuplicate();
    }, [debouncedEmail, debouncedPhone, initialData?.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }
        
        const customerData = { 
            name: values.name, 
            email: values.email, 
            phone: values.phone || null, 
            relationship: values.relationship,
            preferredStaffId: values.preferredStaffId || null,
            lineId: values.lineId || null,
            preferredContactMethod: values.preferredContactMethod || null,
        };
        if (isEditMode && initialData) {
            onSubmit({ ...initialData, ...customerData });
        } else {
            onSubmit(customerData);
        }
    };
    
    const relationshipOptions = Object.values(CustomerRelationship).map(r => ({ value: r, label: r }));
    const staffOptions = [
        { value: '', label: 'No Preference' },
        ...staff.map(s => ({ value: s.id, label: s.name }))
    ];
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
                id="customerName"
                label="Full Name"
                type="text"
                value={values.name}
                onChange={handleInputChange('name')}
                error={errors.name}
            />
            <InputField
                id="customerEmail"
                label="Email"
                type="email"
                value={values.email}
                onChange={handleInputChange('email')}
                error={errors.email}
            />
            <InputField
                id="customerPhone"
                label={<>Phone <span className="text-slate-400 font-normal">(Optional)</span></>}
                type="tel"
                value={values.phone}
                onChange={handleInputChange('phone')}
                error={errors.phone}
            />
            
            {duplicateCustomer && onSwitchToView && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg my-2 flex items-start gap-3 animate-fade-in-up">
                    <div className="flex-shrink-0 pt-0.5">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-bold text-amber-800">Potential Duplicate Found</p>
                        <p className="text-sm text-amber-700 mt-1">
                            A customer named <strong>{duplicateCustomer.name}</strong> already exists with similar contact information.
                        </p>
                         <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onSwitchToView(duplicateCustomer)}
                            className="mt-3 py-1 px-3 text-xs font-semibold"
                        >
                            View Existing Customer
                        </Button>
                    </div>
                </div>
            )}

            <InputField
                id="customerLineId"
                label={<>Line ID <span className="text-slate-400 font-normal">(Optional)</span></>}
                type="text"
                value={values.lineId}
                onChange={handleInputChange('lineId')}
            />
            <Select
                id="customerRelationship"
                label="Relationship Level"
                value={values.relationship}
                onChange={(v) => handleValueChange('relationship', v)}
                options={relationshipOptions}
                error={errors.relationship}
                required
            />
            <Select
                id="preferredStaff"
                label="Preferred Staff"
                value={values.preferredStaffId}
                onChange={(v) => handleValueChange('preferredStaffId', v)}
                options={staffOptions}
            />
            <Select
                id="preferredContactMethod"
                label="Preferred Contact Method"
                value={values.preferredContactMethod}
                onChange={(v) => handleValueChange('preferredContactMethod', v as any)}
                options={[
                    { value: '', label: 'Not Set' },
                    { value: 'Email', label: 'Email' },
                    { value: 'Phone', label: 'Phone' },
                    { value: 'Line', label: 'Line' },
                ]}
            />

            <div className="flex justify-end gap-3 pt-4">
                 <Button type="button" variant="secondary" onClick={onClose} className="font-semibold">
                    Cancel
                </Button>
                <Button type="submit" className="font-bold">
                  {isEditMode ? 'Save Changes' : <><PlusIcon className="w-5 h-5 mr-2" /> Add Customer</>}
                </Button>
            </div>
        </form>
    );
};

export default CustomerForm;