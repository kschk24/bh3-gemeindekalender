import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsService, categoriesService } from '../services/api';
import { EventFilters } from '../types';
import EventCard from '../components/events/EventCard';
import EventFilter from '../components/events/EventFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

// Icons for view mode toggle
const GridIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('calendar');

  // Build filters from URL params
  const filters: EventFilters = {
    search: searchParams.get('search') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    wheelchairAccessible: searchParams.get('wheelchairAccessible') === 'true',
    hearingLoop: searchParams.get('hearingLoop') === 'true',
    signLanguage: searchParams.get('signLanguage') === 'true',
    easyLanguage: searchParams.get('easyLanguage') === 'true',
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  };

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsService.getAll(filters),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  });

  const updateFilters = (newFilters: Partial<EventFilters>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Reset to page 1 when filters change (except page itself)
    if (!('page' in newFilters)) {
      params.delete('page');
    }

    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage });
    // Scroll to top and focus main content
    document.getElementById('main-content')?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Veranstaltungen
        </h1>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1" role="group" aria-label="Ansicht wählen">
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            aria-pressed={viewMode === 'calendar'}
          >
            <CalendarIcon />
            <span className="ml-2 hidden sm:inline">Kalender</span>
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
          >
            <GridIcon />
            <span className="ml-2 hidden sm:inline">Kacheln</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
          >
            <ListIcon />
            <span className="ml-2 hidden sm:inline">Liste</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <EventFilter
        filters={filters}
        categories={categories || []}
        onFilterChange={updateFilters}
      />

      {/* Calendar View */}
      {viewMode === 'calendar' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <iframe
            src="https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=Europe%2FBerlin&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0&mode=MONTH&hl=de"
            className="w-full h-[600px] border-0"
            title="Veranstaltungskalender"
            loading="lazy"
          />
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Kalender wird von Google Calendar bereitgestellt. 
              <button 
                onClick={() => setViewMode('grid')} 
                className="ml-2 text-primary-600 dark:text-primary-400 hover:underline"
              >
                Zur Kachelansicht wechseln
              </button>
            </p>
          </div>
        </div>
      ) : (
        /* Results - Grid/List View */
        <>
          {isLoading ? (
            <LoadingSpinner label="Lade Veranstaltungen..." />
          ) : eventsData?.data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Keine Veranstaltungen gefunden.
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchParams(new URLSearchParams())}
                className="mt-4"
              >
                Filter zurücksetzen
              </Button>
            </div>
          ) : (
            <>
              {/* Results count */}
              <p className="text-gray-600 dark:text-gray-400" aria-live="polite">
                {eventsData?.meta.total} Veranstaltung
                {eventsData?.meta.total !== 1 && 'en'} gefunden
              </p>

              {/* Events Grid/List */}
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {eventsData?.data.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    variant={viewMode === 'list' ? 'horizontal' : 'vertical'}
                  />
                ))}
              </div>

              {/* Pagination */}
              {eventsData && eventsData.meta.totalPages > 1 && (
                <nav
                  className="flex justify-center items-center space-x-2 pt-8"
                  aria-label="Seitennavigation"
                >
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(eventsData.meta.page - 1)}
                    disabled={eventsData.meta.page <= 1}
                  >
                    Zurück
                  </Button>

                  <span className="px-4 text-gray-600 dark:text-gray-400">
                    Seite {eventsData.meta.page} von {eventsData.meta.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(eventsData.meta.page + 1)}
                    disabled={eventsData.meta.page >= eventsData.meta.totalPages}
                  >
                    Weiter
                  </Button>
                </nav>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
