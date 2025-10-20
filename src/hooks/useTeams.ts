import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getTeams,
    createTeam as dalCreateTeam,
    updateTeam as dalUpdateTeam,
    deleteTeam as dalDeleteTeam,
} from '../dal/teams';
import { useAuthStore } from '../store/authStore';
import { useAuditStore } from '../store/auditStore';
import { Team } from '../types';

type MutationCallbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

// --- QUERY HOOK ---
export const useTeams = () => {
    return useQuery({
        queryKey: ['teams'],
        queryFn: getTeams,
    });
};

// --- MUTATION HOOKS ---

type CreateTeamData = {
    name: string;
    description: string | null;
    leadMemberId: string | null;
    status: 'Active' | 'Inactive';
    memberIds: string[];
};

export const useCreateTeam = ({ onSuccess, onError }: MutationCallbacks<Team> = {}) => {
    const queryClient = useQueryClient();
    // const user = useAuthStore((state) => state.user)!;
    // const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: (teamData: CreateTeamData) => dalCreateTeam(teamData),
        onSuccess: (newTeam) => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            // addLog(user.email, 'CREATE_TEAM', `Created new team: ${newTeam.name}.`);
            onSuccess?.(newTeam);
        },
        onError,
    });
};

export const useUpdateTeam = ({ onSuccess, onError }: MutationCallbacks<Team> = {}) => {
    const queryClient = useQueryClient();
    // const user = useAuthStore((state) => state.user)!;
    // const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: (teamData: Team) => dalUpdateTeam(teamData),
        onSuccess: (updatedTeam) => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            // addLog(user.email, 'UPDATE_TEAM', `Updated team: ${updatedTeam.name}.`);
            onSuccess?.(updatedTeam);
        },
        onError,
    });
};

export const useDeleteTeam = ({ onSuccess, onError }: MutationCallbacks<Team> = {}) => {
    const queryClient = useQueryClient();
    // const user = useAuthStore((state) => state.user)!;
    // const addLog = useAuditStore((state) => state.addLog);

    return useMutation({
        mutationFn: async (team: Team) => {
            await dalDeleteTeam(team.id);
            return team;
        },
        onSuccess: (deletedTeam) => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            // addLog(user.email, 'DELETE_TEAM', `Deleted team: ${deletedTeam.name}.`);
            onSuccess?.(deletedTeam);
        },
        onError,
    });
};
