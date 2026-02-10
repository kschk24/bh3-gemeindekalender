import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsService, categoriesService } from '../services/api';
import EventCard from '../components/events/EventCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTranslation } from 'react-i18next';

// Accessibility icons as SVG
const WheelchairIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-2.5 6a1.5 1.5 0 0 0-1.5 1.5V13H5v2h4.5a1.5 1.5 0 0 0 1.5-1.5V11h2v4.5a1.5 1.5 0 0 0 1.5 1.5h3a3.5 3.5 0 1 0 0-7h-2V9.5A1.5 1.5 0 0 0 14 8H9.5zm8 4a1.5 1.5 0 1 1 0 3h-2v-3h2z"/>
  </svg>
);

const HearingIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 20c-.29 0-.56-.06-.76-.15-.71-.37-1.21-.88-1.71-2.38-.51-1.56-1.47-2.29-2.39-3-.79-.61-1.61-1.24-2.32-2.53C9.29 10.98 9 9.93 9 9c0-2.8 2.2-5 5-5s5 2.2 5 5h2c0-3.93-3.07-7-7-7S7 5.07 7 9c0 1.26.38 2.65 1.07 3.9.91 1.65 1.98 2.48 2.85 3.15.81.62 1.39 1.07 1.71 2.05.6 1.82 1.37 2.84 2.73 3.55A3.999 3.999 0 0 0 21 18h-2c0 1.1-.9 2-2 2zM7.64 2.64L6.22 1.22C4.23 3.21 3 5.96 3 9s1.23 5.79 3.22 7.78l1.41-1.41C6.01 13.74 5 11.49 5 9s1.01-4.74 2.64-6.36zM11.5 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0-5 0z"/>
  </svg>
);

const SignLanguageIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.5 2c-1.93 0-3.5 1.57-3.5 3.5v3c0 .28.22.5.5.5s.5-.22.5-.5v-3c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v3c0 .28.22.5.5.5s.5-.22.5-.5v-3c0-1.93-1.57-3.5-3.5-3.5zm-5 5c-1.1 0-2 .9-2 2v4c0 3.31 2.69 6 6 6h3c3.31 0 6-2.69 6-6V9c0-1.1-.9-2-2-2s-2 .9-2 2v2c0 .28-.22.5-.5.5s-.5-.22-.5-.5V9c0-1.1-.9-2-2-2s-2 .9-2 2v2c0 .28-.22.5-.5.5s-.5-.22-.5-.5V9c0-1.1-.9-2-2-2z"/>
  </svg>
);

const EasyLanguageIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
  </svg>
);

export default function HomePage() {
  const { t } = useTranslation();
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventsService.getAll({ limit: 6 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
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
              <EventCard key={event.id} event={event} />
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
            {[
            { Icon: WheelchairIcon, key: 'wheelchair' },
            { Icon: HearingIcon, key: 'hearingLoop' },
            { Icon: SignLanguageIcon, key: 'signLanguage' },
            { Icon: EasyLanguageIcon, key: 'easyLanguage' },
          ].map(({ Icon, key }) => (
            <Link
              key={key}
              to={`/events?${key === 'wheelchair' ? 'wheelchairAccessible' : key === 'hearingLoop' ? 'hearingLoop' : key === 'signLanguage' ? 'signLanguage' : 'easyLanguage'}=true`}
              className="flex items-center space-x-3 bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
            >
              <span className="text-primary-600 dark:text-primary-400" aria-hidden="true">
                <Icon />
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {t(`home.accessLabels.${key}`)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
