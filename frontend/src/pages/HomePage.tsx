import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsService, categoriesService } from '../services/api';
import EventCard from '../components/events/EventCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function HomePage() {
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventsService.getAll({ limit: 6 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  });

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section
        className="text-center py-12 px-4 bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl text-white"
        aria-labelledby="hero-heading"
      >
        <h1
          id="hero-heading"
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Willkommen zum Gemeindekalender
        </h1>
        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          Entdecken Sie lokale Veranstaltungen in Ihrer Gemeinde. 
          Barrierefrei und für alle zugänglich.
        </p>
        <Link
          to="/events"
          className="inline-block bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
        >
          Alle Veranstaltungen ansehen
        </Link>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section aria-labelledby="categories-heading">
          <h2
            id="categories-heading"
            className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Kategorien
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
                  {category._count?.events || 0} Veranstaltungen
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
            Kommende Veranstaltungen
          </h2>
          <Link
            to="/events"
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            Alle ansehen →
          </Link>
        </div>

        {eventsLoading ? (
          <LoadingSpinner label="Lade Veranstaltungen..." />
        ) : eventsData?.data.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-12">
            Keine kommenden Veranstaltungen gefunden.
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
        className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8"
        aria-labelledby="accessibility-heading"
      >
        <h2
          id="accessibility-heading"
          className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Barrierefreiheit
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Unser Kalender ist für alle zugänglich. Filtern Sie Veranstaltungen 
          nach Barrierefreiheits-Kriterien.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '♿', label: 'Rollstuhlgerecht' },
            { icon: '🦻', label: 'Induktionsschleife' },
            { icon: '🤟', label: 'Gebärdensprache' },
            { icon: '📖', label: 'Leichte Sprache' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center space-x-3 bg-white dark:bg-gray-700 p-4 rounded-lg"
            >
              <span className="text-2xl" aria-hidden="true">
                {icon}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
