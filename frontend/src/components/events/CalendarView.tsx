import { useMemo, useCallback } from 'react';
import { useEventDetail } from '../../context/EventDetailContext';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Event } from '../../types';
import { favoritesService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup date-fns localizer with multiple locales
const locales = {
  'de': de,
  'en': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
  getDay,
  locales,
});

// Calendar event type
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  resource: Event;
}

interface CalendarViewProps {
  events: Event[];
  isLoading?: boolean;
}

export default function CalendarView({ events, isLoading }: CalendarViewProps) {
  const { openEvent } = useEventDetail();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();

  // Get current locale for date-fns
  const currentLocale = i18n.language === 'de' ? de : enUS;

  // Dynamic translations for react-big-calendar
  const messages = useMemo(() => ({
    allDay: t('calendar.allDay'),
    previous: t('calendar.previous'),
    next: t('calendar.next'),
    today: t('calendar.today'),
    month: t('calendar.month'),
    week: t('calendar.week'),
    day: t('calendar.day'),
    date: t('calendar.date'),
    time: t('calendar.time'),
    event: t('calendar.event'),
    noEventsInRange: t('calendar.noEventsInRange'),
    showMore: (total: number) => t('calendar.showMore', { count: total }),
  }), [t]);

  // Fetch favorites
  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesService.getAll,
    enabled: isAuthenticated,
  });

  // Toggle favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: ({ eventId, add }: { eventId: string; add: boolean }) =>
      add ? favoritesService.add(eventId) : favoritesService.remove(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  // Check if event is favorited
  const isFavorited = useCallback(
    (eventId: string) => !!favorites?.some((f) => f.id === eventId),
    [favorites]
  );

  // Custom event component for week/day views
  const EventComponent = useCallback(
    ({ event }: { event: CalendarEvent }) => {
      const favorited = isFavorited(event.id);
      
      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openEvent(event.id);
        }
      };
      
      return (
        <div 
          className="h-full flex flex-col px-2 py-1 gap-1 group cursor-pointer"
          tabIndex={0}
          role="button"
          aria-label={`${event.title}. ${t('calendar.pressEnterForDetails')}`}
          onKeyDown={handleKeyDown}
          onClick={() => openEvent(event.id)}
        >
          <div className="text-sm font-medium leading-tight truncate">
            {event.title}
          </div>
          {isAuthenticated && (
            <div className="flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  favoriteMutation.mutate({ eventId: event.id, add: !favorited });
                }}
                disabled={favoriteMutation.isPending}
                className="text-yellow-300 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label={favorited ? t('event.favoriteRemove') : t('event.favoriteAdd')}
                title={favorited ? t('event.favoriteRemove') : t('event.favoriteAdd')}
              >
                {favorited ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      );
    },
    [isAuthenticated, favoriteMutation, isFavorited, t, openEvent]
  );
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.startDate),
      end: new Date(event.endDate),
      color: event.category?.color || '#3b82f6',
      resource: event,
    }));
  }, [events]);

  // Handle event click - open detail modal
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      openEvent(event.id);
    },
    [openEvent]
  );

  // Custom event styling based on category color
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontWeight: 500,
      },
    };
  }, []);

  // Custom toolbar component for better styling
  const formats = useMemo(() => ({
    monthHeaderFormat: 'MMMM yyyy',
    dayHeaderFormat: 'EEEE, d. MMMM',
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${format(start, 'd. MMMM', { locale: currentLocale })} - ${format(end, 'd. MMMM yyyy', { locale: currentLocale })}`,
  }), [currentLocale]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center h-[600px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="calendar-container p-4">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          messages={messages}
          formats={formats}
          culture={i18n.language}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          defaultView={Views.MONTH}
          popup
          selectable={false}
          tooltipAccessor={(event) => event.title}
          components={{
            event: EventComponent,
          }}
        />
      </div>
      
      {/* Legend */}
      {events.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {t('calendar.clickForDetails')}
          </p>
        </div>
      )}

      {/* Custom styles for dark mode compatibility */}
      <style>{`
        .calendar-container .rbc-calendar {
          font-family: inherit;
        }
        
        .calendar-container .rbc-header {
          padding: 8px 4px;
          font-weight: 600;
        }
        
        .calendar-container .rbc-toolbar {
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .calendar-container .rbc-toolbar button {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: white;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .calendar-container .rbc-toolbar button:hover {
          background: #f3f4f6;
        }
        
        .calendar-container .rbc-toolbar button.rbc-active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        
        .calendar-container .rbc-today {
          background-color: #eff6ff;
        }
        
        .calendar-container .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        
        .calendar-container .rbc-event {
          padding: 2px 5px;
          font-size: 12px;
        }
        
        .calendar-container .rbc-event:focus,
        .calendar-container .rbc-event:focus-within {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          z-index: 10;
        }
        
        .calendar-container .rbc-event > div:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        .calendar-container .rbc-show-more {
          color: #3b82f6;
          font-weight: 500;
        }
        
        /* Dark mode styles */
        .dark .calendar-container .rbc-calendar {
          color: #e5e7eb;
        }
        
        .dark .calendar-container .rbc-toolbar button {
          background: #374151;
          border-color: #4b5563;
          color: #e5e7eb;
        }
        
        .dark .calendar-container .rbc-toolbar button:hover {
          background: #4b5563;
        }
        
        .dark .calendar-container .rbc-toolbar button.rbc-active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
        
        .dark .calendar-container .rbc-header {
          color: #e5e7eb;
          border-color: #4b5563;
        }
        
        .dark .calendar-container .rbc-event:focus,
        .dark .calendar-container .rbc-event:focus-within,
        .dark .calendar-container .rbc-event > div:focus {
          outline: 2px solid #60a5fa;
          outline-offset: 2px;
        }
        
        .dark .calendar-container .rbc-month-view,
        .dark .calendar-container .rbc-time-view,
        .dark .calendar-container .rbc-agenda-view {
          border-color: #4b5563;
        }
        
        .dark .calendar-container .rbc-day-bg,
        .dark .calendar-container .rbc-month-row {
          border-color: #4b5563;
        }
        
        .dark .calendar-container .rbc-today {
          background-color: rgba(59, 130, 246, 0.1);
        }
        
        .dark .calendar-container .rbc-off-range-bg {
          background-color: #1f2937;
        }
        
        .dark .calendar-container .rbc-off-range {
          color: #6b7280;
        }
        
        .dark .calendar-container .rbc-date-cell {
          color: #e5e7eb;
        }
        
        .dark .calendar-container .rbc-time-content,
        .dark .calendar-container .rbc-time-header-content {
          border-color: #4b5563;
        }
        
        .dark .calendar-container .rbc-timeslot-group {
          border-color: #4b5563;
        }
        
        .dark .calendar-container .rbc-time-slot {
          border-color: #374151;
        }
        
        .dark .calendar-container .rbc-label {
          color: #9ca3af;
        }
        
        .dark .calendar-container .rbc-agenda-date-cell,
        .dark .calendar-container .rbc-agenda-time-cell {
          color: #e5e7eb;
        }
        
        .dark .calendar-container .rbc-agenda-table {
          border-color: #4b5563;
        }
        
        .dark .calendar-container .rbc-agenda-table thead > tr > th {
          border-color: #4b5563;
        }
        
        .dark .calendar-container .rbc-agenda-table tbody > tr > td {
          border-color: #4b5563;
        }
      `}</style>
    </div>
  );
}
