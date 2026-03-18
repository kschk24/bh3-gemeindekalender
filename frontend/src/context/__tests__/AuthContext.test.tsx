import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../AuthContext';
import { ConsentProvider } from '../ConsentContext';
import { ThemeProvider } from '../ThemeContext';
import { AccessibilityProvider } from '../AccessibilityContext';
import { Role } from '../../types';

// Mock api module
vi.mock('../../services/api', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    refresh: vi.fn().mockResolvedValue({ user: { id: '1', email: 'a@b.de', role: 'USER' as const, createdAt: '' } }),
    logout: vi.fn(),
  },
  authEvents: new EventTarget(),
  setCsrfToken: vi.fn(),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConsentProvider>
          <ThemeProvider>
            <AccessibilityProvider>
              <AuthProvider>{children}</AuthProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </ConsentProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('restores session from refresh cookie on mount', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('a@b.de');
  });

  it('sets user on login', async () => {
    const { authService } = await import('../../services/api');
    vi.mocked(authService.login).mockResolvedValue({ user: { id: '2', email: 'b@c.de', role: Role.USER, createdAt: '' } });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => !result.current.isLoading);

    await act(() => result.current.login('b@c.de', 'pw'));
    expect(result.current.user?.email).toBe('b@c.de');
  });

  it('clears user on logout', async () => {
    const { authService } = await import('../../services/api');
    vi.mocked(authService.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => !result.current.isLoading);

    await act(() => result.current.logout());
    expect(result.current.user).toBeNull();
  });
});
