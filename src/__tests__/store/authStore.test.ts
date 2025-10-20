
// FIX: Add imports for Jest's global APIs, including `expect`, to resolve TypeScript errors.
import { describe, it, beforeEach, jest, expect } from '@jest/globals';
import { useAuthStore } from '../../store/authStore';
import { useAuditStore } from '../../store/auditStore';

// Mock the audit store to prevent it from interfering with auth tests
jest.mock('../../store/auditStore', () => ({
  useAuditStore: {
    getState: () => ({
      addLog: jest.fn(),
    }),
  },
}));

describe('useAuthStore', () => {
  const initialState = useAuthStore.getState();
  const mockAddLog = useAuditStore.getState().addLog;

  beforeEach(() => {
    // Reset the store to its initial state before each test
    useAuthStore.setState(initialState, true);
    // Clear any previous mock calls
    jest.clearAllMocks();
  });

  it('should have a default state of not being authenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('should allow a user to log in with correct credentials', async () => {
    const email = 'admin@tinedy.com';
    const password = 'password123';
    
    await useAuthStore.getState().login(email, password);
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).not.toBeNull();
    expect(state.user?.email).toBe(email);
    expect(state.user?.role).toBe('admin');
  });

  it('should add a log to the audit trail on successful login', async () => {
    const email = 'admin@tinedy.com';
    const password = 'password123';

    await useAuthStore.getState().login(email, password);

    expect(mockAddLog).toHaveBeenCalledTimes(1);
    expect(mockAddLog).toHaveBeenCalledWith(email, 'USER_LOGIN', 'User logged in successfully.');
  });

  it('should throw an error for incorrect credentials', async () => {
    const email = 'admin@tinedy.com';
    const password = 'wrongpassword';

    await expect(useAuthStore.getState().login(email, password)).rejects.toThrow('Invalid email or password');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('should allow a user to log out', async () => {
    // First, log in
    await useAuthStore.getState().login('staff@tinedy.com', 'password123');
    let state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);

    // Then, log out
    useAuthStore.getState().logout();
    state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});