import { createContext, useContext, useState, ReactNode } from 'react';

interface EventDetailContextType {
  eventId: string | null;
  openEvent: (id: string) => void;
  closeEvent: () => void;
}

const EventDetailContext = createContext<EventDetailContextType | null>(null);

export function EventDetailProvider({ children }: { children: ReactNode }) {
  const [eventId, setEventId] = useState<string | null>(null);

  const openEvent = (id: string) => setEventId(id);
  const closeEvent = () => setEventId(null);

  return (
    <EventDetailContext.Provider value={{ eventId, openEvent, closeEvent }}>
      {children}
    </EventDetailContext.Provider>
  );
}

export function useEventDetail() {
  const ctx = useContext(EventDetailContext);
  if (!ctx) throw new Error('useEventDetail must be used within EventDetailProvider');
  return ctx;
}
