import { create } from 'zustand';
import { Team } from '../types';

interface TeamState {
    teams: Team[];
    setTeams: (teams: Team[]) => void;
    addTeam: (team: Team) => void;
    updateTeam: (team: Team) => void;
    removeTeam: (teamId: string) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
    teams: [],
    setTeams: (teams) => set({ teams }),
    addTeam: (team) => set((state) => ({
        teams: [...state.teams, team]
    })),
    updateTeam: (team) => set((state) => ({
        teams: state.teams.map(t => t.id === team.id ? team : t)
    })),
    removeTeam: (teamId) => set((state) => ({
        teams: state.teams.filter(t => t.id !== teamId)
    })),
}));
