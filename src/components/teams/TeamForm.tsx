import React, { useEffect, useMemo, useState } from 'react';
import { StaffMember, Team, TeamStatus } from '../../types';
import { PlusIcon, ExclamationTriangleIcon } from '../ui/icons';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import Select from '../ui/Select';
import Switch from '../ui/Switch';
import { useFormValidation, ValidationSchema } from '../../hooks/useFormValidation';
import SearchInput from '../ui/SearchInput';
import Checkbox from '../ui/Checkbox';

interface TeamFormProps {
    onSubmit: (teamData: Omit<Team, 'id' | 'members'> | Team) => void;
    onClose: () => void;
    initialData?: Team | null;
    allStaff: StaffMember[];
    allTeams: Team[];
}

interface TeamFormState {
    name: string;
    description: string;
    leadMemberId: string;
    status: TeamStatus;
}

const validationSchema: ValidationSchema<TeamFormState> = {
    name: { required: 'Team name is required.' },
};

const MAX_TEAMS_PER_STAFF = 3;

const TeamForm: React.FC<TeamFormProps> = ({ onSubmit, onClose, initialData, allStaff, allTeams }) => {
    const isEditMode = !!initialData;
    
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(initialData?.members.map(m => m.id) || []);
    const [memberSearch, setMemberSearch] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    const initialFormState = useMemo(() => ({
        name: initialData?.name || '',
        description: initialData?.description || '',
        leadMemberId: initialData?.leadMemberId || '',
        status: initialData?.status || 'Active',
    }), [initialData]);

    const { values, errors, validate, handleInputChange, handleValueChange, resetForm } = useFormValidation<TeamFormState>(
        initialFormState,
        validationSchema
    );

    useEffect(() => {
        resetForm(initialFormState);
    }, [initialFormState, resetForm]);

    const staffTeamCounts = useMemo(() => {
        const counts = new Map<string, number>();
        allTeams.forEach(team => {
            // When editing, don't count the current team against the limit
            if (isEditMode && team.id === initialData?.id) return;
            team.members.forEach(member => {
                counts.set(member.id, (counts.get(member.id) || 0) + 1);
            });
        });
        return counts;
    }, [allTeams, isEditMode, initialData]);

    const handleToggleMember = (staffId: string) => {
        setFormError(null);
        setSelectedMemberIds(prev => {
            const newSelection = prev.includes(staffId)
                ? prev.filter(id => id !== staffId)
                : [...prev, staffId];

            if (values.leadMemberId && !newSelection.includes(values.leadMemberId)) {
                handleValueChange('leadMemberId', '');
            }
            return newSelection;
        });
    };

    const availableStaff = useMemo(() => {
        return allStaff.filter(s => s.name.toLowerCase().includes(memberSearch.toLowerCase()));
    }, [allStaff, memberSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!validate()) return;
        
        if (selectedMemberIds.length < 2) {
            setFormError('A team must have at least 2 members.');
            return;
        }
        if (!values.leadMemberId) {
            setFormError('A team lead must be selected.');
            return;
        }

        const teamData = {
            ...values,
            memberIds: selectedMemberIds,
        };

        onSubmit(isEditMode && initialData ? { ...teamData, id: initialData.id } : teamData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField id="teamName" label="Team Name" value={values.name} onChange={handleInputChange('name')} error={errors.name} />
            <InputField as="textarea" id="teamDesc" label="Description (Optional)" value={values.description} onChange={handleInputChange('description')} rows={3} />
            
            <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Team Members</h3>
                <SearchInput value={memberSearch} onChange={setMemberSearch} placeholder="Search staff..."/>
                <div className="mt-2 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-2 space-y-1">
                    {availableStaff.map(staff => {
                        const isSelected = selectedMemberIds.includes(staff.id);
                        const teamCount = staffTeamCounts.get(staff.id) || 0;
                        const isDisabled = !isSelected && teamCount >= MAX_TEAMS_PER_STAFF;
                        return (
                            <label key={staff.id} className={`flex items-center gap-3 p-2 rounded-md transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                <Checkbox checked={isSelected} onChange={() => handleToggleMember(staff.id)} disabled={isDisabled} />
                                <div>
                                    <span className="font-semibold text-slate-800 dark:text-slate-100">{staff.name}</span>
                                    {isDisabled && <span className="text-xs text-amber-600 ml-2">(Already in {teamCount} teams)</span>}
                                </div>
                            </label>
                        )
                    })}
                </div>
            </div>

            <Select
                id="teamLead"
                label="Team Lead"
                value={values.leadMemberId}
                onChange={(v) => handleValueChange('leadMemberId', v)}
                options={allStaff
                    .filter(s => selectedMemberIds.includes(s.id))
                    .map(s => ({ value: s.id, label: s.name }))
                }
                error={errors.leadMemberId}
                disabled={selectedMemberIds.length === 0}
                placeholder="Select a team member"
            />
            
            <div className="flex items-center justify-between">
                 <label className="block text-sm font-medium text-slate-600">Team Status</label>
                 <Switch
                    id="teamStatus"
                    checked={values.status === 'Active'}
                    onChange={(checked) => handleValueChange('status', checked ? 'Active' : 'Inactive')}
                    offLabel="Inactive"
                    onLabel="Active"
                 />
            </div>
            
            {formError && (
                 <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span>{formError}</span>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose} className="font-semibold">Cancel</Button>
                <Button type="submit" className="font-bold">
                    {isEditMode ? 'Save Changes' : <><PlusIcon className="w-5 h-5 mr-2" /> Create Team</>}
                </Button>
            </div>
        </form>
    );
};

export default TeamForm;
