import { Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { eventsService, categoriesService, favoritesService } from '../services/api';
import EventCard from '../components/events/EventCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY_OPTIONS } from '../constants/accessibility';
import type { AccessibilityKey } from '../constants/accessibility';
import { CATEGORY_ICONS } from '../constants/categories';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 6;

export default function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [activeFilters, setActiveFilters] = useState<AccessibilityKey[]>([]);
  const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>([]);

  const accessibilityFilters = Object.fromEntries(activeFilters.map((k) => [k, true]));

  const {
    data: eventsData,
    isLoading: eventsLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['events', 'upcoming', [...activeFilters].sort(), [...activeCategoryIds].sort()],
    queryFn: ({ pageParam = 1 }) =>
      eventsService.getAll({
        limit: PAGE_SIZE,
        page: pageParam as number,
        ...(activeCategoryIds.length > 0 ? { categoryId: activeCategoryIds } : {}),
        ...accessibilityFilters,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
  });

  // Trigger next page when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allEvents = eventsData?.pages.flatMap((p) => p.data) ?? [];

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  });

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesService.getAll,
    enabled: isAuthenticated,
  });

  const toggleFilter = (key: AccessibilityKey) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const toggleCategory = (id: string) => {
    setActiveCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const hasAnyFilter = activeFilters.length > 0 || activeCategoryIds.length > 0;

  const viewAllParams = new URLSearchParams();
  activeCategoryIds.forEach((id) => viewAllParams.append('categoryId', id));
  activeFilters.forEach((f) => viewAllParams.set(f, 'true'));
  const viewAllHref = `/events${viewAllParams.size ? `?${viewAllParams}` : ''}`;

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section
        className="py-10 px-6 bg-primary-500 rounded-lg text-white"
        aria-labelledby="hero-heading"
      >
        <div className="max-w-3xl">
          <h1
            id="hero-heading"
            className="text-3xl md:text-4xl font-bold mb-3"
          >
            {t('home.heroTitle')}
          </h1>
          <p className="text-lg mb-6 text-white">
            {t('home.heroText')}
          </p>
          <Link
            to="/events"
            className="inline-block bg-white text-primary-700 px-6 py-2.5 rounded font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500"
          >
            {t('home.toCalendar')}
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section aria-labelledby="categories-heading">
          <div className="flex items-center justify-between mb-6">
            <h2
              id="categories-heading"
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              {t('home.categories')}
            </h2>
            {activeCategoryIds.length > 0 && (
              <button
                onClick={() => setActiveCategoryIds([])}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline focus:outline-none"
              >
                {t('home.clearFilter')}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const isActive = activeCategoryIds.includes(category.id);
              const Icon = CATEGORY_ICONS[category.name.toLowerCase()];
              return (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  aria-pressed={isActive}
                  className={`card text-center hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    isActive
                      ? 'border-primary-400 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:border-primary-300 dark:hover:border-primary-600'
                  }`}
                >
                  <div
                    className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.color, opacity: isActive ? 1 : 0.85 }}
                    aria-hidden="true"
                  >
                    {Icon && <Icon className="w-7 h-7 text-white" />}
                  </div>
                  <h3 className={`font-medium ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('home.eventsCount', { count: category._count?.events || 0 })}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Accessibility Filter */}
      <section aria-labelledby="accessibility-heading">
        <div className="flex items-center justify-between mb-3">
          <h2
            id="accessibility-heading"
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            {t('home.accessibility')}
          </h2>
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline focus:outline-none"
            >
              {t('home.clearFilter')}
            </button>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
          {t('home.accessibilityIntro')}
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ACCESSIBILITY_OPTIONS.map(({ key, Icon }) => {
            const isActive = activeFilters.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-400 dark:border-primary-500'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
                aria-pressed={isActive}
              >
                <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 ${
                  isActive
                    ? 'bg-primary-500 dark:bg-primary-600'
                    : 'bg-primary-100 dark:bg-primary-900/50'
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`} aria-hidden="true" />
                </span>
                <span className={`text-sm font-medium ${
                  isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'
                }`}>
                  {t(`home.accessLabels.${key === 'wheelchairAccessible' ? 'wheelchair' : key === 'hearingLoop' ? 'hearingLoop' : key === 'signLanguage' ? 'signLanguage' : 'easyLanguage'}`)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Upcoming Events */}
      <section aria-labelledby="upcoming-heading">
        <div className="flex items-center justify-between mb-6">
          <h2
            id="upcoming-heading"
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            {t('home.upcoming')}
            {hasAnyFilter && (
              <span className="ml-2 text-base font-normal text-primary-600 dark:text-primary-400">
                {[
                  ...activeCategoryIds.map((id) => categories?.find((c) => c.id === id)?.name ?? ''),
                  ...activeFilters.map((f) => t(`home.accessLabels.${f === 'wheelchairAccessible' ? 'wheelchair' : f === 'hearingLoop' ? 'hearingLoop' : f === 'signLanguage' ? 'signLanguage' : 'easyLanguage'}`)),
                ].filter(Boolean).map((label) => `· ${label}`).join(' ')}
              </span>
            )}
          </h2>
          <Link
            to={viewAllHref}
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            {t('home.viewAll')}
          </Link>
        </div>

        {eventsLoading ? (
          <LoadingSpinner label={t('home.loading') || t('loading')} />
        ) : allEvents.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-12">
            {t('home.noUpcoming')}
          </p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isFavorited={favorites?.some((f) => f.id === event.id) ?? false}
                />
              ))}
            </div>

            <div ref={sentinelRef} />

            {isFetchingNextPage && (
              <LoadingSpinner label={t('home.loading') || t('loading')} />
            )}

            {!hasNextPage && allEvents.length > 0 && (
              <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
                {t('home.allEventsLoaded')}
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
