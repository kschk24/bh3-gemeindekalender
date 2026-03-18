import { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ConsentProvider } from '../context/ConsentContext';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConsentProvider>
          <ThemeProvider>
            <AccessibilityProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </ConsentProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export function renderWithProviders(ui: ReactNode, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
