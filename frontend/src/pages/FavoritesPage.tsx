import { useQuery } from '@tanstack/react-query';
import { Link, Navigate } from 'react-router-dom';
import { favoritesService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/events/EventCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function FavoritesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesService.getAll,
    enabled: isAuthenticated,
  });

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (authLoading || isLoading) {
    return <LoadingSpinner label="Lade Favoriten..." />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Meine Favoriten
      </h1>

      {favorites?.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Sie haben noch keine Favoriten gespeichert.
          </p>
          <Link
            to="/events"
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            Veranstaltungen entdecken →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
