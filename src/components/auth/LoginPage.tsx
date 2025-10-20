
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import { supabaseInitError } from '../../lib/supabaseClient';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@tinedy.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the global auth store for error handling
  const { login, error, setError } = useAuthStore((state) => ({
    login: state.login,
    error: state.error,
    setError: state.setError,
  }));

  // Set initial error state from supabase client initialization
  useEffect(() => {
      if (supabaseInitError) {
          setError(supabaseInitError);
      }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
        setError('Both email and password are required.');
        setIsLoading(false);
        return;
    }

    try {
      await login(trimmedEmail, password);
      // On successful login, the App component will automatically re-render the main app
    } catch (err: any) {
      if (err.message === 'Invalid login credentials') {
        setError('The email or password you entered is incorrect. Please try again.');
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      // Don't clear the configuration error when user types
      if (error && !supabaseInitError) setError(null);
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      // Don't clear the configuration error when user types
      if (error && !supabaseInitError) setError(null);
  };

  return (
    <div className="min-h-screen bg-tinedy-off-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-tinedy-blue font-display tracking-wide">TINEDY</h1>
            <p className="text-slate-600 mt-2">CRM Portal Login</p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg shadow-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              id="email"
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleEmailChange}
              hasError={!!error}
              placeholder="you@example.com"
              disabled={!!supabaseInitError}
            />

            <InputField
              id="password"
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={handlePasswordChange}
              hasError={!!error}
              placeholder="••••••••"
              disabled={!!supabaseInitError}
            />
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <p className="font-bold">{supabaseInitError ? 'Configuration Error' : 'Login Failed'}</p>
                <p>{error}</p>
              </div>
            )}

            <div>
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
                disabled={!!supabaseInitError}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
            {supabaseInitError && (
                 <p className="mt-4 text-xs text-center text-slate-500">Please contact an administrator to set up the application.</p>
             )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
