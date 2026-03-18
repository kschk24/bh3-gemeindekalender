import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, MessageCircle, Palette, Activity, BookOpen, Music, Heart, Leaf, type LucideIcon } from 'lucide-react';
import { Event } from '../../types';
import { favoritesService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useEventDetail } from '../../context/EventDetailContext';
import AccessibilityBadges from './AccessibilityBadges';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'kultur':  Palette,
  'sport':   Activity,
  'bildung': BookOpen,
  'musik':   Music,
  'familie': Heart,
  'umwelt':  Leaf,
};

function CategoryPlaceholder({ event, className }: { event: Event; className: string }) {
  const color = event.category?.color ?? '#6b7280';
  const Icon = CATEGORY_ICONS[event.category?.name?.toLowerCase() ?? ''];
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(135deg, ${color}18, ${color}35)` }}
      aria-hidden="true"
    >
      {Icon && <Icon className="w-12 h-12" style={{ color, opacity: 0.35 }} />}
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
      className={`card hover:shadow-lg transition-shadow overflow-hidden ${
        isHorizontal ? 'flex gap-4' : 'h-full flex flex-col'
      }`}
    >
      {/* Image or category placeholder */}
      <div className={isHorizontal ? 'w-48 flex-shrink-0' : 'flex-shrink-0 -mx-5 -mt-5'}>
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
      </div>

      <div className="flex-1 flex flex-col">
        {/* Spacer to push content to bottom */}
        <div className="flex-1"></div>
        
        {/* Content Container - aligned to bottom */}
        <div className={`flex-shrink-0 ${event.imageUrl ? 'mt-4' : ''}`}>
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
      </div>
    </article>
  );
}
