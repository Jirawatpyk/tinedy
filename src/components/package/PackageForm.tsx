import React, { useEffect, useMemo } from 'react';
import { Package, Service } from '../../types';
import { SERVICES } from '../../constants';
import { PlusIcon } from '../ui/icons';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import Checkbox from '../ui/Checkbox';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';

interface PackageFormState {
    name: string;
    description: string;
    price: string;
    duration: string;
    services: Service[];
}

const validationSchema: ValidationSchema<PackageFormState> = {
    name: { required: 'Package name is required.' },
    price: {
        required: 'Price is required.',
        custom: (value) => {
            const priceNum = parseFloat(value);
            return isNaN(priceNum) || priceNum <= 0 ? 'Price must be a positive number.' : null;
        }
    },
    duration: {
        required: 'Duration is required.',
        custom: (value) => {
            const durationNum = parseInt(value, 10);
            return isNaN(durationNum) || durationNum <= 0 || !Number.isInteger(durationNum) ? 'Duration must be a positive whole number.' : null;
        }
    },
    services: {
        custom: (value) => value.length === 0 ? 'At least one service must be selected.' : null
    }
};

interface PackageFormProps {
  onSubmit: (pkgData: Omit<Package, 'id' | 'createdAt'> | Package) => void;
  onClose: () => void;
  initialData?: Package | null;
}

const PackageForm: React.FC<PackageFormProps> = ({ onSubmit, onClose, initialData }) => {
    const isEditMode = !!initialData;
    
    const initialFormState = useMemo(() => {
        if (initialData) {
            return {
                name: initialData.name,
                description: initialData.description || '',
                price: String(initialData.price),
                duration: String(initialData.duration),
                services: initialData.services,
            };
        }
        return {
            name: '',
            description: '',
            price: '',
            duration: '',
            services: [],
        };
    }, [initialData]);

    const { values, errors, validate, handleInputChange, handleValueChange, resetForm } = useFormValidation<PackageFormState>(
        initialFormState,
        validationSchema
    );
    
    useEffect(() => {
        resetForm(initialFormState);
    }, [initialFormState, resetForm]);
    
    const handleServiceToggle = (service: Service) => {
        const newServices = values.services.includes(service)
            ? values.services.filter(s => s !== service)
            : [...values.services, service];
        handleValueChange('services', newServices);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }
        
        const packageData = { 
            name: values.name, 
            description: values.description || null, 
            price: parseFloat(values.price), 
            duration: parseInt(values.duration, 10), 
            services: values.services 
        };
        onSubmit(isEditMode && initialData ? { ...initialData, ...packageData } : packageData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
                id="pkgName"
                label="Package Name"
                type="text"
                value={values.name}
                onChange={handleInputChange('name')}
                error={errors.name}
            />
            <InputField
                as="textarea"
                id="pkgDesc"
                label={<>Description <span className="text-slate-400 font-normal">(Optional)</span></>}
                value={values.description}
                onChange={handleInputChange('description')}
                rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
                <InputField
                    id="pkgPrice"
                    label="Price (฿)"
                    type="number"
                    value={values.price}
                    onChange={handleInputChange('price')}
                    min="0"
                    step="0.01"
                    error={errors.price}
                />
                <InputField
                    id="pkgDuration"
                    label="Duration (minutes)"
                    type="number"
                    value={values.duration}
                    onChange={handleInputChange('duration')}
                    min="0"
                    step="1"
                    error={errors.duration}
                />
            </div>
             <div>
                <span className="block text-sm font-medium text-slate-600 mb-2">Included Services</span>
                <div className="space-y-2">
                    {SERVICES.map(service => (
                        <label key={service.value} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox 
                                checked={values.services.includes(service.value)}
                                onChange={() => handleServiceToggle(service.value)}
                            />
                            <span className="text-slate-700">{service.label}</span>
                        </label>
                    ))}
                </div>
                {errors.services && <p className="mt-2 text-xs text-red-600">{errors.services}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose} className="font-semibold">
                    Cancel
                </Button>
                <Button type="submit" className="font-bold">
                  {isEditMode ? 'Save Changes' : <><PlusIcon className="w-5 h-5 mr-2" /> Add Package</>}
                </Button>
            </div>
        </form>
    );
};

export default PackageForm;