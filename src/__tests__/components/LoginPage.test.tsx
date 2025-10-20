// FIX: Use a triple-slash directive to bring in jest-dom type definitions.
// This resolves "Property 'toBeInTheDocument' does not exist" errors and avoids
// conflicts that can arise from using an import statement for types.
/// <reference types="@testing-library/jest-dom" />
// FIX: Add imports for Jest's global APIs, including `expect`, to resolve TypeScript errors.
import { describe, it, beforeEach, jest, expect } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../../components/auth/LoginPage';
import { useAuthStore } from '../../store/authStore';
import { User } from '../../types';

// Mock the entire store module
jest.mock('../../store/authStore');

// Typecast the mock to make TypeScript happy
// FIX: Cast to unknown first to resolve complex type incompatibility between Zustand and Jest mocks.
const useAuthStoreMock = useAuthStore as unknown as jest.Mock;
// FIX: Explicitly type the mock function to match the original function signature.
// This resolves issues where TypeScript infers 'never' for promise-related mock methods.
const mockLogin = jest.fn<(email: string, password: string) => Promise<User>>();

describe('LoginPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockLogin.mockReset();
    // This mock implementation will handle the selector `(state) => state.login`
    // inside the LoginPage component.
    useAuthStoreMock.mockReturnValue(mockLogin);
  });

  it('renders the login form correctly', () => {
    render(<LoginPage />);
    
    expect(screen.getByRole('heading', { name: /tinedy/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('allows the user to enter email and password', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('calls the login function with credentials when the form is submitted', async () => {
    const user = userEvent.setup();
    // Mock a successful login
    // FIX: Added missing 'notificationPreferences' to satisfy the User type.
    // FIX: Add 'MENTION' property to satisfy NotificationPreferences type.
    mockLogin.mockResolvedValueOnce({ id: '1', email: 'test@example.com', role: 'staff', notificationPreferences: { 'NEW_BOOKING': true, 'ASSIGNMENT': true, 'STATUS_CHANGE': true, 'CANCELLATION': true, 'MENTION': true } });
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signInButton);

    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('displays an error message on failed login', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid email or password';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(emailInput, 'bad@user.com');
    await user.type(passwordInput, 'badpass');

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(signInButton);

    // Wait for the error message to appear in the document
    const errorElement = await screen.findByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
  });

  it('shows a loading state when submitting', async () => {
    const user = userEvent.setup();
    // Create a promise that we can resolve later to keep it in a loading state
    let resolveLogin: (value: User | PromiseLike<User>) => void;
    const loginPromise = new Promise<User>(resolve => {
      resolveLogin = resolve;
    });
    mockLogin.mockReturnValue(loginPromise);

    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signInButton);

    expect(signInButton).toBeDisabled();
    expect(screen.getByText('Signing in...')).toBeInTheDocument();

    // Clean up the promise to avoid test warnings
    // FIX: Added missing 'notificationPreferences' property to the mock User object to satisfy the User type.
    // FIX: Add 'MENTION' property to satisfy NotificationPreferences type.
    resolveLogin!({ id: '1', email: 'test@example.com', role: 'staff', notificationPreferences: { 'NEW_BOOKING': true, 'ASSIGNMENT': true, 'STATUS_CHANGE': true, 'CANCELLATION': true, 'MENTION': true } }); 
  });
});