import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, MessageCircle } from 'lucide-react';
import { Event } from '../../types';
import { favoritesService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useEventDetail } from '../../context/EventDetailContext';
import AccessibilityBadges from './AccessibilityBadges';

interface EventCardProps {
  event: Event;
  variant?: 'vertical' | 'horizontal';
  isFavorited?: boolean;
}

export default function EventCard({
  event,
  variant = 'vertical',
  isFavorited = false,
}: EventCardProps) {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { openEvent } = useEventDetail();
  const queryClient = useQueryClient();
  const startDate = new Date(event.startDate);

  const locale = i18n.language === 'de' ? de : enUS;

  // Toggle favorite mutation (add or remove based on current state)
  const favoriteMutation = useMutation({
    mutationFn: ({ add }: { add: boolean }) =>
      add ? favoritesService.add(event.id) : favoritesService.remove(event.id),
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
            sizes={isHorizontal ? '192px' : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'}
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
          <button
            onClick={() => openEvent(event.id)}
            className="hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:underline text-left"
          >
            {event.title}
          </button>
        </h3>

        {/* Date & Time */}
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          <time dateTime={event.startDate}>
            {format(startDate, 'EEEE, d. MMM yyyy', { locale })}
            {' · '}
            {format(startDate, 'HH:mm', { locale })}{' '}{t('event.timeUnit')}
          </time>
        </p>

        {/* Location */}
        <p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4 flex-shrink-0 text-primary-500" aria-hidden="true" />
          {event.location}
        </p>

        {/* Accessibility Badges */}
        {event.accessibility && (
          <div className="mt-3">
            <AccessibilityBadges accessibility={event.accessibility} compact />
          </div>
        )}

        {/* Comments Count */}
        {event._count?.comments !== undefined && event._count.comments > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-4 h-4 flex-shrink-0 text-primary-500" aria-hidden="true" />
            {t('event.comments', { count: event._count.comments })}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => openEvent(event.id)}
            className="text-primary-600 dark:text-primary-400 font-medium hover:underline focus:outline-none focus:underline"
          >
            {t('event.details')}
          </button>

          {isAuthenticated && (
            <button
              onClick={() => favoriteMutation.mutate({ add: !isFavorited })}
              disabled={favoriteMutation.isPending}
              className="text-yellow-400 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isFavorited ? t('event.favoriteRemove', { title: event.title }) : t('event.favoriteAdd', { title: event.title })}
              title={isFavorited ? t('event.favoriteRemove') : t('event.favoriteAdd')}
            >
              {isFavorited ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
