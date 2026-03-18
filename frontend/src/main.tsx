import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './i18n';
import LoadingSpinner from './components/common/LoadingSpinner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ConsentProvider } from './context/ConsentContext';
import { setCsrfToken } from './services/api';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - Green IT: weniger Requests
      retry: 1,
    },
  },
});

// Fetch CSRF token on boot
const API_URL = import.meta.env.VITE_API_URL || '/api';
fetch(`${API_URL}/csrf-token`, { credentials: 'include' })
  .then((r) => r.json())
  .then((data: { csrfToken?: string }) => {
    if (data.csrfToken) setCsrfToken(data.csrfToken);
  })
  .catch(() => {/* CSRF fetch failed — proceed anyway */});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConsentProvider>
        <ThemeProvider>
          <AccessibilityProvider>
            <AuthProvider>
              <React.Suspense fallback={<LoadingSpinner />}>
                <App />
              </React.Suspense>
            </AuthProvider>
          </AccessibilityProvider>
        </ThemeProvider>
        </ConsentProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
