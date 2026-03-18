import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsService, categoriesService, favoritesService } from '../services/api';
import EventCard from '../components/events/EventCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY_OPTIONS } from '../constants/accessibility';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventsService.getAll({ limit: 6 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  });

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesService.getAll,
    enabled: isAuthenticated,
  });

  return (
    <div className="space-y-10">
      {/* Hero Section - Professional, flat design */}
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
          <p className="text-lg mb-6 text-primary-100">
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
          <h2
            id="categories-heading"
            className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
          >
            {t('home.categories')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/events?categoryId=${category.id}`}
                className="card text-center hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <div
                  className="w-12 h-12 mx-auto mb-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                  aria-hidden="true"
                />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('home.eventsCount', { count: category._count?.events || 0 })}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section aria-labelledby="upcoming-heading">
        <div className="flex items-center justify-between mb-6">
          <h2
            id="upcoming-heading"
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            {t('home.upcoming')}
          </h2>
          <Link
            to="/events"
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            {t('home.viewAll')}
          </Link>
        </div>

        {eventsLoading ? (
          <LoadingSpinner label={t('home.loading') || t('loading')} />
        ) : eventsData?.data.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-12">
            {t('home.noUpcoming')}
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsData?.data.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isFavorited={favorites?.some((f) => f.id === event.id) ?? false}
              />
            ))}
          </div>
        )}
      </section>

      {/* Accessibility Info */}
      <section
        className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        aria-labelledby="accessibility-heading"
      >
        <h2
          id="accessibility-heading"
          className="text-xl font-bold text-gray-900 dark:text-white mb-3"
        >
          {t('home.accessibility')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
          {t('home.accessibilityIntro')}
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ACCESSIBILITY_OPTIONS.map(({ key, label, Icon }) => (
            <Link
              key={key}
              to={`/events?${key}=true`}
              className="flex items-center space-x-3 bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
            >
              <Icon className="w-5 h-5 flex-shrink-0 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
