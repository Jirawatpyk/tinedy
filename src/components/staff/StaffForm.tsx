import React, { useEffect, useMemo } from 'react';
import { StaffMember } from '../../types';
import { PlusIcon } from '../ui/icons';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import Select from '../ui/Select';
import { defaultNotificationPreferences } from '../../constants';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';

interface StaffFormProps {
    onSubmit: (staffData: Omit<StaffMember, 'id'> | StaffMember, password?: string) => void;
    onClose: () => void;
    initialData?: StaffMember | null;
}

interface StaffFormState {
    name: string;
    email: string;
    phone: string;
    role: string;
    skills: string; // Stored as comma-separated string in form state
    rating: string;
    password?: string;
    confirmPassword?: string;
}

const roleOptions = [
    { value: 'staff', label: 'Staff Member' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Administrator' },
];

const StaffForm: React.FC<StaffFormProps> = ({ onSubmit, onClose, initialData }) => {
    const isEditMode = !!initialData;
    
    const validationSchema: ValidationSchema<StaffFormState> = useMemo(() => ({
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
        role: {
            required: 'Role is required.'
        },
        rating: {
            custom: (value) => {
                if (!value) return null;
                const num = parseFloat(value);
                if (isNaN(num) || num < 0 || num > 5) {
                    return 'Rating must be a number between 0 and 5.';
                }
                return null;
            }
        },
        ...(!isEditMode && {
            password: {
                required: 'Password is required for new staff.',
                minLength: { value: 6, message: 'Password must be at least 6 characters long.' }
            },
            confirmPassword: {
                custom: (value, allValues) => value !== allValues.password ? 'Passwords do not match.' : null
            }
        })
    }), [isEditMode]);

    const initialFormState = useMemo(() => {
        if (initialData) {
            return {
                name: initialData.name,
                email: initialData.email,
                phone: initialData.phone || '',
                role: initialData.role,
                skills: (initialData.skills || []).join(', '),
                rating: initialData.rating !== null ? String(initialData.rating) : '',
                password: '',
                confirmPassword: '',
            };
        }
        return {
            name: '',
            email: '',
            phone: '',
            role: 'staff',
            skills: '',
            rating: '',
            password: '',
            confirmPassword: '',
        };
    }, [initialData]);

    const { values, errors, validate, handleInputChange, handleValueChange, resetForm } = useFormValidation<StaffFormState>(
        initialFormState,
        validationSchema
    );

    useEffect(() => {
        resetForm(initialFormState);
    }, [initialFormState, resetForm]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }
        
        const { password, confirmPassword, skills, rating, ...staffCoreData } = values;
        
        const parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
        const parsedRating = rating ? parseFloat(rating) : null;

        const staffData = { 
            ...staffCoreData, 
            phone: staffCoreData.phone || null,
            skills: parsedSkills.length > 0 ? parsedSkills : null,
            rating: parsedRating,
        };

        if (isEditMode && initialData) {
            onSubmit({ ...initialData, ...staffData });
        } else {
            // FIX: Add missing 'staffNumber' property to satisfy the StaffMember type on creation.
            onSubmit({ 
                ...staffData, 
                staffNumber: `STF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
                notificationPreferences: defaultNotificationPreferences 
            }, password);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
                id="staffName"
                label="Full Name"
                type="text"
                value={values.name}
                onChange={handleInputChange('name')}
                error={errors.name}
            />
            <InputField
                id="staffEmail"
                label="Email"
                type="email"
                value={values.email}
                onChange={handleInputChange('email')}
                error={errors.email}
                disabled={isEditMode}
            />
             <InputField
                id="staffPhone"
                label={<>Phone <span className="text-slate-400 font-normal">(Optional)</span></>}
                type="tel"
                value={values.phone}
                onChange={handleInputChange('phone')}
                error={errors.phone}
            />
            <Select
                id="staffRole"
                label="Role / Position"
                value={values.role}
                onChange={(v) => handleValueChange('role', v)}
                options={roleOptions}
                error={errors.role}
                required
            />
             <InputField
                id="staffSkills"
                label="Skills (comma-separated)"
                type="text"
                value={values.skills}
                onChange={handleInputChange('skills')}
                error={errors.skills}
                placeholder="e.g. Deep Cleaning, Cardio, Senior Care"
            />
             <InputField
                id="staffRating"
                label="Rating (0.0 to 5.0)"
                type="number"
                value={values.rating}
                onChange={handleInputChange('rating')}
                error={errors.rating}
                min="0"
                max="5"
                step="0.1"
            />


            {!isEditMode && (
                <>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Set Initial Password</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                id="password"
                                label="Password"
                                type="password"
                                value={values.password}
                                onChange={handleInputChange('password')}
                                error={errors.password}
                            />
                            <InputField
                                id="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                value={values.confirmPassword}
                                onChange={handleInputChange('confirmPassword')}
                                error={errors.confirmPassword}
                            />
                        </div>
                    </div>
                </>
            )}

            <div className="flex justify-end gap-3 pt-4">
                 <Button type="button" variant="secondary" onClick={onClose} className="font-semibold">
                    Cancel
                </Button>
                <Button type="submit" className="font-bold">
                  {isEditMode ? 'Save Changes' : <><PlusIcon className="w-5 h-5 mr-2" /> Add Member</>}
                </Button>
            </div>
        </form>
    );
};

export default StaffForm;
