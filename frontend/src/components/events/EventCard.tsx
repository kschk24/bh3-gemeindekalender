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
import { CATEGORY_ICONS } from '../../constants/categories';

function CategoryPlaceholder({ event, className }: { event: Event; className: string }) {
  const color = event.category?.color ?? '#6b7280';
  const Icon = CATEGORY_ICONS[event.category?.name?.toLowerCase() ?? ''];
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(150deg, ${color}22 0%, ${color}44 100%)` }}
      aria-hidden="true"
    >
      {Icon && <Icon className="w-14 h-14" style={{ color, opacity: 0.45 }} />}
    </div>
  );
}

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

  const favoriteMutation = useMutation({
    mutationFn: ({ add }: { add: boolean }) =>
      add ? favoritesService.add(event.id) : favoritesService.remove(event.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const isHorizontal = variant === 'horizontal';

  const handleCardClick = () => {
    openEvent(event.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEvent(event.id);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${event.title}. ${t('event.pressEnterForDetails')}`}
      className={`card hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        isHorizontal ? 'flex gap-4' : 'h-full flex flex-col'
      }`}
    >
      {/* Image / placeholder with overlaid chips */}
      <div className={`relative ${isHorizontal ? 'w-48 flex-shrink-0' : 'flex-shrink-0 -mx-5 -mt-5'}`}>
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt=""
            className={`object-cover ${isHorizontal ? 'w-full h-full' : 'w-full h-44'}`}
            loading="lazy"
            sizes={isHorizontal ? '192px' : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'}
          />
        ) : (
          <CategoryPlaceholder
            event={event}
            className={isHorizontal ? 'w-full h-full' : 'w-full h-44'}
          />
        )}

        {/* Favorite button — top-right overlay */}
        {isAuthenticated && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              favoriteMutation.mutate({ add: !isFavorited });
            }}
            disabled={favoriteMutation.isPending}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm text-yellow-400 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            aria-label={isFavorited ? t('event.favoriteRemove', { title: event.title }) : t('event.favoriteAdd', { title: event.title })}
            title={isFavorited ? t('event.favoriteRemove') : t('event.favoriteAdd')}
          >
            {isFavorited ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col mt-4">
        {/* Category chip */}
        {event.category && (
          <span
            className="self-start px-2.5 py-1 rounded-full text-xs font-semibold text-white mb-2"
            style={{ backgroundColor: event.category.color }}
          >
            {event.category.name}
          </span>
        )}

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug">
          {event.title}
        </h3>

        {/* Date & Time */}
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          <time dateTime={event.startDate}>
            {format(startDate, 'EEEE, d. MMM yyyy', { locale })}
            {' · '}
            {format(startDate, 'HH:mm', { locale })}{' '}{t('event.timeUnit')}
          </time>
        </p>

        {/* Location */}
        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary-400" aria-hidden="true" />
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
          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500">
            <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            {t('event.comments', { count: event._count.comments })}
          </p>
        )}

        {/* Spacer pushes footer to bottom */}
        <div className="flex-1" />

        {/* Details link */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
            {t('event.details')}
          </span>
        </div>
      </div>
    </article>
  );
}
