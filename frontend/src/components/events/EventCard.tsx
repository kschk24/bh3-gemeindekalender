import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Event } from '../../types';
import { favoritesService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AccessibilityBadges from './AccessibilityBadges';

interface EventCardProps {
  event: Event;
  variant?: 'vertical' | 'horizontal';
  showFavoriteButton?: boolean;
}

export default function EventCard({
  event,
  variant = 'vertical',
  showFavoriteButton = false,
}: EventCardProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const startDate = new Date(event.startDate);

  const removeFavoriteMutation = useMutation({
    mutationFn: () => favoritesService.remove(event.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const isHorizontal = variant === 'horizontal';

  return (
    <article
      className={`card hover:shadow-lg transition-shadow ${
        isHorizontal ? 'flex gap-4' : ''
      }`}
    >
      {/* Image */}
      {event.imageUrl && (
        <div
          className={
            isHorizontal ? 'w-48 flex-shrink-0' : 'mb-4 -mx-6 -mt-6'
          }
        >
          <img
            src={event.imageUrl}
            alt=""
            className={`object-cover ${
              isHorizontal ? 'w-full h-full rounded-l-lg' : 'w-full h-40 rounded-t-lg'
            }`}
            loading="lazy"
          />
        </div>
      )}

      <div className="flex-1">
        {/* Category Badge */}
        <span
          className="inline-block px-2 py-1 rounded text-xs font-medium text-white"
          style={{ backgroundColor: event.category?.color }}
        >
          {event.category?.name}
        </span>

        {/* Title */}
        <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Link
            to={`/events/${event.id}`}
            className="hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:underline"
          >
            {event.title}
          </Link>
        </h3>

        {/* Date & Time */}
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          <time dateTime={event.startDate}>
            {format(startDate, 'EEEE, d. MMM yyyy', { locale: de })}
            {' · '}
            {format(startDate, 'HH:mm', { locale: de })} Uhr
          </time>
        </p>

        {/* Location */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          📍 {event.location}
        </p>

        {/* Accessibility Badges */}
        {event.accessibility && (
          <div className="mt-3">
            <AccessibilityBadges accessibility={event.accessibility} compact />
          </div>
        )}

        {/* Comments Count */}
        {event._count?.comments !== undefined && event._count.comments > 0 && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            💬 {event._count.comments} {event._count.comments === 1 ? 'Kommentar' : 'Kommentare'}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <Link
            to={`/events/${event.id}`}
            className="text-primary-600 dark:text-primary-400 font-medium hover:underline focus:outline-none focus:underline"
          >
            Details ansehen →
          </Link>

          {showFavoriteButton && isAuthenticated && (
            <button
              onClick={() => removeFavoriteMutation.mutate()}
              disabled={removeFavoriteMutation.isPending}
              className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
              aria-label={`${event.title} aus Favoriten entfernen`}
            >
              ❤️
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
