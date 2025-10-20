import React, { useState, useCallback } from 'react';

// Define the shape of a single validation rule
export type ValidationRule<T> = {
  value: T;
  message: string;
};

// Define all possible validation rules for a field, including a custom validator
export interface FieldRules<TValues> {
  required?: string;
  minLength?: ValidationRule<number>;
  maxLength?: ValidationRule<number>;
  pattern?: ValidationRule<RegExp>;
  custom?: (value: any, allValues: TValues) => string | null;
}

// The validation schema is a record of field names to their rules
export type ValidationSchema<T> = {
  [K in keyof T]?: FieldRules<T>;
};

// The return type of our hook
export interface UseFormValidationReturn<T> {
  values: T;
  setValues: React.Dispatch<React.SetStateAction<T>>;
  errors: Record<keyof T, string | null>;
  validate: () => boolean;
  handleInputChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleValueChange: (field: keyof T, value: any) => void;
  resetForm: (newState?: Partial<T>) => void;
}

/**
 * A generic hook to manage form state, validation, and errors.
 * @param initialState The initial state of the form values.
 * @param schema The validation schema defining rules for each field.
 * @returns An object with form state, error state, and helper functions.
 */
export function useFormValidation<T extends Record<string, any>>(
  initialState: T,
  schema: ValidationSchema<T>
): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<Record<keyof T, string | null>>(
    // FIX: Add type assertion to the initial value of reduce to prevent incorrect type inference.
    () => Object.keys(initialState).reduce((acc, key) => ({ ...acc, [key]: null }), {} as Record<keyof T, string | null>)
  );

  const validate = useCallback(() => {
    let isValid = true;
    const newErrors: Record<keyof T, string | null> = { ...errors };

    for (const key in schema) {
      if (Object.prototype.hasOwnProperty.call(schema, key)) {
        const rules = schema[key];
        const value = values[key];
        let error: string | null = null;
        
        if (rules) {
          // Required
          if (rules.required && (value === undefined || value === null || String(value).trim() === '')) {
              error = rules.required;
          }
          // MinLength
          if (!error && rules.minLength && String(value).length < rules.minLength.value) {
              error = rules.minLength.message;
          }
          // MaxLength
          if (!error && rules.maxLength && String(value).length > rules.maxLength.value) {
              error = rules.maxLength.message;
          }
          // Pattern - only test if value is not empty
          if (!error && rules.pattern && String(value).trim() !== '' && !rules.pattern.value.test(String(value))) {
              error = rules.pattern.message;
          }
          // Custom
          if (!error && rules.custom) {
              error = rules.custom(value, values); // Pass all values for cross-field validation
          }
        }
        
        if (error) {
          isValid = false;
        }
        newErrors[key] = error;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, schema, errors]);

  const handleInputChange = useCallback((field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value, type } = e.target;
    // Handle checkbox input type correctly
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setValues(prev => ({ ...prev, [field]: finalValue }));
    // Clear error for the field being typed in
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const handleValueChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const resetForm = useCallback((newState?: Partial<T>) => {
    const finalState = { ...initialState, ...newState };
    setValues(finalState);
    // FIX: Add type assertion to the initial value of reduce and correct the setErrors call.
    // The updater function was unnecessary and had an incorrect signature.
    setErrors(
      Object.keys(finalState).reduce((acc, key) => ({ ...acc, [key]: null }), {} as Record<keyof T, string | null>)
    );
  }, [initialState]);

  return {
    values,
    setValues,
    errors,
    validate,
    handleInputChange,
    handleValueChange,
    resetForm,
  };
}