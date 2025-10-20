import React, { useState, useMemo } from 'react';
import { StaffMember, ToastType, AppNotificationType, NotificationPreferences, NotificationSetting } from '../types';
import { updateStaff } from '../dal/staff';
import { supabase } from '../lib/supabaseClient';
import { useAuditStore } from '../store/auditStore';
import { useAuthStore } from '../store/authStore';
import { useStaffStore } from '../store/staffStore';
import Card from '../components/ui/Card';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import Checkbox from '../components/ui/Checkbox';
import { UserCircleIcon } from '../components/ui/icons';
import { useFormValidation, ValidationSchema } from '../hooks/useFormValidation';

interface ProfileViewProps {
    addToast: (message: string, type: ToastType, title: string) => void;
}

const NOTIFICATION_DEFINITIONS: { key: AppNotificationType; label: string; subOption?: { key: keyof Extract<NotificationSetting, object>, label: string } }[] = [
    { key: 'NEW_BOOKING', label: 'New Bookings' },
    { key: 'ASSIGNMENT', label: 'My Staff Assignments' },
    { 
      key: 'STATUS_CHANGE', 
      label: 'Booking Status Changes',
      subOption: {
        key: 'assignedToMeOnly',
        label: 'Only for bookings assigned to me'
      }
    },
    { key: 'CANCELLATION', label: 'Cancellations' },
    { key: 'MENTION', label: 'Mentions in Comments' },
];

const defaultPrefs: NotificationPreferences = {
    'NEW_BOOKING': true,
    'ASSIGNMENT': true,
    'STATUS_CHANGE': true,
    'CANCELLATION': true,
    'MENTION': true,
};

const infoValidationSchema: ValidationSchema<{ name: string; phone: string; }> = {
    name: { required: 'Full name is required.' },
    phone: { pattern: { value: /^[0-9-()\s+]*$/, message: 'Please enter a valid phone number.' } }
};

const passwordValidationSchema: ValidationSchema<{ newPassword: string; confirmPassword: string; }> = {
    newPassword: {
        required: 'New password is required.',
        minLength: { value: 6, message: 'New password must be at least 6 characters long.' }
    },
    confirmPassword: {
        required: 'Please confirm your new password.',
        custom: (value, allValues) => value !== allValues.newPassword ? 'Passwords do not match.' : null,
    }
};

const ProfileView: React.FC<ProfileViewProps> = ({ addToast }) => {
    const user = useAuthStore((state) => state.user)!;
    const updateUserProfileInStore = useAuthStore((state) => state.updateUserProfile);
    const { staff, updateStaff: updateStaffInStore } = useStaffStore();
    const addLog = useAuditStore((state) => state.addLog);
    
    const userProfile = staff.find(s => s.id === user.id);

    const [isInfoSaving, setIsInfoSaving] = useState(false);
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);
    const [isPrefsSaving, setIsPrefsSaving] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [prefs, setPrefs] = useState<NotificationPreferences>({ ...defaultPrefs, ...(userProfile?.notificationPreferences || {}) });

    const initialInfoState = useMemo(() => ({
        name: userProfile?.name || '',
        phone: userProfile?.phone || ''
    }), [userProfile]);
    
    const infoForm = useFormValidation(
        initialInfoState, 
        infoValidationSchema
    );

    const passwordForm = useFormValidation({
        newPassword: '',
        confirmPassword: ''
    }, passwordValidationSchema);

    if (!userProfile) {
        return <div className="text-center p-10">Could not load user profile.</div>;
    }

    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!infoForm.validate()) return;
        setIsInfoSaving(true);
        try {
            const updatedProfile = await updateStaff({
                ...userProfile,
                name: infoForm.values.name,
                phone: infoForm.values.phone || null,
            });
            updateStaffInStore(updatedProfile);
            addLog(user!.email, 'UPDATE_STAFF', 'Updated own profile information.');
            addToast('Profile information updated successfully.', 'success', 'Profile Saved');
        } catch (err: any) {
            addToast(err.message || 'Failed to update profile.', 'error', 'Update Failed');
        } finally {
            setIsInfoSaving(false);
        }
    };
    
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        if (!passwordForm.validate()) return;

        setIsPasswordSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: passwordForm.values.newPassword });
            if (error) throw error;

            addLog(user.email, 'UPDATE_STAFF', 'Changed own password.');
            addToast('Password changed successfully.', 'success', 'Password Updated');
            passwordForm.resetForm();
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to change password.';
            setPasswordError(errorMessage);
            addToast(errorMessage, 'error', 'Update Failed');
        } finally {
            setIsPasswordSaving(false);
        }
    };
    
    const handlePrefsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPrefsSaving(true);
        try {
            const updatedProfile = await updateStaff({
                ...userProfile,
                notificationPreferences: prefs,
            });
            updateStaffInStore(updatedProfile);
            updateUserProfileInStore({ notificationPreferences: updatedProfile.notificationPreferences });
            addLog(user.email, 'UPDATE_STAFF', 'Updated own notification preferences.');
            addToast('Notification preferences saved.', 'success', 'Preferences Saved');
        } catch (err: any) {
             addToast(err.message || 'Failed to save preferences.', 'error', 'Update Failed');
        } finally {
            setIsPrefsSaving(false);
        }
    };

    const handleMainPrefChange = (key: AppNotificationType) => {
        setPrefs(prev => {
            const currentSetting = prev[key];
            const isObject = typeof currentSetting === 'object' && currentSetting !== null;
            const newEnabledState = isObject ? !currentSetting.enabled : !currentSetting;
            
            if (NOTIFICATION_DEFINITIONS.find(def => def.key === key)?.subOption) {
                return {
                    ...prev,
                    [key]: {
                        enabled: newEnabledState,
                        assignedToMeOnly: isObject ? (currentSetting as any).assignedToMeOnly || false : false,
                    }
                };
            } else {
                return { ...prev, [key]: newEnabledState };
            }
        });
    };

    const handleSubPrefChange = (key: AppNotificationType, subKey: 'assignedToMeOnly', value: boolean) => {
        setPrefs(prev => {
            const currentSetting = prev[key];
            if (typeof currentSetting === 'object' && currentSetting !== null) {
                return { ...prev, [key]: { ...currentSetting, [subKey]: value }};
            }
            return prev;
        });
    };

    const displayRole = userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="bg-tinedy-blue/20 p-3 rounded-lg">
                   <UserCircleIcon className="w-8 h-8 text-tinedy-blue"/>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
                    <p className="text-slate-500">Manage your personal information and account settings.</p>
                </div>
            </div>

            <Card>
                <form onSubmit={handleInfoSubmit}>
                    <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4">Personal Information</h2>
                    <div className="space-y-4">
                         <InputField id="profile-name" label="Full Name" type="text" value={infoForm.values.name} onChange={infoForm.handleInputChange('name')} error={infoForm.errors.name} />
                         <InputField id="profile-email" label="Email Address" type="email" value={userProfile.email} disabled />
                         <InputField id="profile-phone" label="Phone Number" type="tel" value={infoForm.values.phone} onChange={infoForm.handleInputChange('phone')} error={infoForm.errors.phone} />
                         <InputField id="profile-role" label="Role" type="text" value={displayRole} disabled />
                    </div>
                    <div className="flex justify-end mt-6">
                        <Button type="submit" isLoading={isInfoSaving}>Save Changes</Button>
                    </div>
                </form>
            </Card>

            <Card>
                 <form onSubmit={handlePasswordSubmit}>
                    <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4">Change Password</h2>
                    <div className="space-y-4">
                         <InputField id="new-password" label="New Password" type="password" value={passwordForm.values.newPassword} onChange={passwordForm.handleInputChange('newPassword')} error={passwordForm.errors.newPassword} />
                         <InputField id="confirm-password" label="Confirm New Password" type="password" value={passwordForm.values.confirmPassword} onChange={passwordForm.handleInputChange('confirmPassword')} error={passwordForm.errors.confirmPassword} />
                    </div>
                    {passwordError && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{passwordError}</p>}
                    <div className="flex justify-end mt-6">
                        <Button type="submit" isLoading={isPasswordSaving}>Update Password</Button>
                    </div>
                </form>
            </Card>
            
            <Card>
                <form onSubmit={handlePrefsSubmit}>
                    <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4">Notification Settings</h2>
                    <p className="text-sm text-slate-500 mb-4">Select which in-app notifications you would like to receive.</p>
                    <div className="space-y-3">
                        {NOTIFICATION_DEFINITIONS.map(({ key, label, subOption }) => {
                            const setting = prefs[key];
                            const isEnabled = typeof setting === 'boolean' ? setting : (setting?.enabled ?? false);
                            
                            return (
                                <div key={key}>
                                    <label className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer">
                                        <Checkbox checked={isEnabled} onChange={() => handleMainPrefChange(key)} />
                                        <span className="text-slate-700 font-medium">{label}</span>
                                    </label>
                                    {subOption && isEnabled && (
                                        <div className="pl-12 mt-2">
                                            <label className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer text-sm">
                                                <Checkbox
                                                    checked={(typeof setting === 'object' && (setting as any)[subOption.key]) || false}
                                                    onChange={(e) => handleSubPrefChange(key, subOption.key as 'assignedToMeOnly', e.target.checked)}
                                                />
                                                <span className="text-slate-600">{subOption.label}</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                     <div className="flex justify-end mt-6">
                        <Button type="submit" isLoading={isPrefsSaving}>Save Preferences</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ProfileView;