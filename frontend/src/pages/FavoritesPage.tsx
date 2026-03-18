import { useQuery } from '@tanstack/react-query';
import { Link, Navigate } from 'react-router-dom';
import { favoritesService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/events/EventCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { exportEventsToIcal } from '../utils/eventExport';

export default function FavoritesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesService.getAll,
    enabled: isAuthenticated,
  });

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (authLoading || isLoading) {
    return <LoadingSpinner label={t('event.loadingFavorites')} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('event.myFavorites')}
        </h1>
        {favorites && favorites.length > 0 && (
          <button
            onClick={() => exportEventsToIcal(favorites)}
            aria-label={t('event.exportAllIcalAria')}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {t('event.exportAllIcal')}
          </button>
        )}
      </div>

      {favorites?.length === 0 ? (
        <div className="text-center py-16 card">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-yellow-300 dark:text-yellow-500"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          <p className="text-gray-700 dark:text-gray-300 text-xl font-semibold mb-2">
            {t('event.noFavoritesMessage')}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {t('event.noFavoritesHint')}
          </p>
          <Link
            to="/events"
            className="inline-block bg-primary-600 text-white px-6 py-2.5 rounded font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {t('event.discoverEvents')}
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites?.map((event) => (
            <EventCard key={event.id} event={event} isFavorited={true} />
          ))}
        </div>
      )}
    </div>
  );
}
