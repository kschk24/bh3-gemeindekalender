import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Event } from '../../types';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup date-fns localizer for German
const locales = {
  'de': de,
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

// German translations for react-big-calendar
const messages = {
  allDay: 'Ganztägig',
  previous: 'Zurück',
  next: 'Weiter',
  today: 'Heute',
  month: 'Monat',
  week: 'Woche',
  day: 'Tag',
  date: 'Datum',
  time: 'Uhrzeit',
  event: 'Veranstaltung',
  noEventsInRange: 'Keine Veranstaltungen in diesem Zeitraum.',
  showMore: (total: number) => `+${total} weitere`,
};

export default function CalendarView({ events, isLoading }: CalendarViewProps) {
  const navigate = useNavigate();

  // Transform events to calendar format
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

  // Handle event click - navigate to detail page
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      navigate(`/events/${event.id}`);
    },
    [navigate]
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
  const formats = {
    monthHeaderFormat: 'MMMM yyyy',
    dayHeaderFormat: 'EEEE, d. MMMM',
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${format(start, 'd. MMMM', { locale: de })} - ${format(end, 'd. MMMM yyyy', { locale: de })}`,
  };

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
          culture="de"
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          defaultView={Views.MONTH}
          popup
          selectable={false}
          tooltipAccessor={(event) => event.title}
        />
      </div>
      
      {/* Legend */}
      {events.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Klicken Sie auf eine Veranstaltung, um Details anzuzeigen.
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
        
        .calendar-container .rbc-event:focus {
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
