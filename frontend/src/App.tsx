import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import CookieConsent from './components/gdpr/CookieConsent';
import { EventDetailProvider } from './context/EventDetailContext';

// Lazy loading für Green IT - Code Splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

function App() {
  return (
    <EventDetailProvider>
      <ErrorBoundary>
        <Layout>
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                <Route path="/events" element={<ErrorBoundary><EventsPage /></ErrorBoundary>} />
                <Route path="/favorites" element={<ErrorBoundary><FavoritesPage /></ErrorBoundary>} />
                <Route path="/admin" element={<ErrorBoundary><AdminPage /></ErrorBoundary>} />
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </Layout>
      </ErrorBoundary>
      <Toaster richColors closeButton position="bottom-right" />
      <CookieConsent />
    </EventDetailProvider>
  );
}

export default App;
