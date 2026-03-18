import { useQuery } from '@tanstack/react-query';
import { eventsService } from '../../services/api';
import EventFormModal from './EventFormModal';
import LoadingSpinner from '../common/LoadingSpinner';

interface Props {
  eventId: string | null;
  onClose: () => void;
}

export default function EditEventModal({ eventId, onClose }: Props) {
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsService.getById(eventId!),
    enabled: !!eventId,
  });

  if (!eventId) return null;
  if (isLoading) return <LoadingSpinner />;
  if (!event) return null;

  return <EventFormModal isOpen onClose={onClose} initialEvent={event} />;
}
