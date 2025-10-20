
import { create } from 'zustand';
import { User, Role, NotificationPreferences } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
    setError: (error: string | null) => void;
    updateUserProfile: (updates: Partial<Pick<User, 'notificationPreferences'>>) => void;
}

export const useAuthStore = create<AuthState>()(
    (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true, // Start in loading state until the first session check is complete
        error: null,
        
        login: async (email, password) => {
            set({ error: null }); // Clear previous errors on a new login attempt
            if (!supabase) throw new Error("Database client not available.");
            
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) throw error;
            // State will be updated by the onAuthStateChange listener in App.tsx
        },
        
        logout: async () => {
            if (!supabase) throw new Error("Database client not available.");
            await supabase.auth.signOut();
            set({ user: null, isAuthenticated: false });
        },

        setUser: (user) => {
            set({ user, isAuthenticated: !!user, isLoading: false });
        },

        setError: (error) => {
            set({ error });
        },
        
        updateUserProfile: (updates) => {
            set((state) => {
                if (state.user) {
                    return { user: { ...state.user, ...updates } };
                }
                return {};
            });
        }
    })
);