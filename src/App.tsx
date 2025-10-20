

import React, { useEffect } from 'react';
import { Role, User } from './types';
import LoginPage from './components/auth/LoginPage';
import { getStaffProfileByUserId } from './dal/staff';
import { supabase } from './lib/supabaseClient';
import { useAuthStore } from './store/authStore';
import { useAuditStore } from './store/auditStore';
import { useThemeStore } from './store/themeStore';
import Loader from './components/ui/Loader';
import { Session } from '@supabase/supabase-js';
import MainLayout from './MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import StaffPortalLayout from './layouts/StaffPortalLayout';

const App: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuthStore((state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
    }));
    const setUser = useAuthStore((state) => state.setUser);
    const setAuthError = useAuthStore((state) => state.setError);
    const addLog = useAuditStore((state) => state.addLog);
    const theme = useThemeStore((state) => state.theme);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);


    useEffect(() => {
        if (!supabase) {
            console.error("Supabase client not initialized.");
            setUser(null); // Ensure loading is false and not authenticated
            return;
        }

        // Handles setting the user state from a Supabase session.
        const setSessionUser = async (session: Session | null) => {
            if (session?.user) {
                try {
                    const profile = await getStaffProfileByUserId(session.user.id);
                    if (profile) {
                        const userForStore: User = {
                            id: profile.id,
                            email: session.user.email!,
                            role: profile.role as Role,
                            notificationPreferences: profile.notificationPreferences,
                        };
                        setUser(userForStore);
                    } else {
                        console.error("User exists in Supabase Auth but has no profile in 'staff' table. Forcing logout.");
                        setAuthError('Authentication successful, but no staff profile was found. Please contact an administrator.');
                        await supabase.auth.signOut();
                        setUser(null);
                    }
                } catch (error: any) {
                    // Log a more descriptive error message to the console for debugging
                    const errorMessage = error?.message ? `${error.message}${error?.details ? ` (${error.details})` : ''}` : 'An unknown error occurred.';
                    console.error("Error fetching user profile during auth state change:", errorMessage, error);
                    
                    // Set a user-friendly error message that will be displayed on the login page
                    setAuthError('There was a problem loading your user profile. Please try logging in again or contact support.');
                    
                    // Sign out the user to prevent them from being in a broken, partially-logged-in state
                    await supabase.auth.signOut();
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        // Proactively fetch the session on initial load to immediately determine auth state.
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSessionUser(session);
        });

        // Listen for subsequent auth changes (e.g., login, logout).
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSessionUser(session);
                // Log the sign-in event specifically.
                if (event === 'SIGNED_IN' && session?.user?.email) {
                    addLog(session.user.email, 'USER_LOGIN', `User logged in successfully.`);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, addLog, setAuthError]);
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-tinedy-off-white dark:bg-slate-900">
                <Loader />
            </div>
        );
    }

    const renderLayout = () => {
        if (!isAuthenticated || !user) {
            return <LoginPage />;
        }
        if (user.role === 'staff') {
            return <StaffPortalLayout />;
        }
        return <MainLayout />;
    };


    return (
        <ErrorBoundary>
            {renderLayout()}
        </ErrorBoundary>
    );
};

export default App;