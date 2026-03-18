import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Trash2, Pencil, CalendarDays, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { eventsService } from '../services/api';
import { Role } from '../types';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EventFormModal from '../components/events/EventFormModal';
import EditEventModal from '../components/events/EditEventModal';

export default function EventManagerPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-events', page],
    queryFn: () => eventsService.getMine(page),
    enabled: !authLoading && (user?.role === Role.EVENT_MANAGER || user?.role === Role.ADMIN),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Veranstaltung gelöscht');
    },
    onError: () => toast.error(t('error.generic')),
  });

  if (authLoading) return <LoadingSpinner />;
  if (!user || (user.role !== Role.EVENT_MANAGER && user.role !== Role.ADMIN)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-7 h-7 text-primary-600" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meine Veranstaltungen</h1>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          Neue Veranstaltung
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner label={t('loading')} />
      ) : !data || data.data.length === 0 ? (
        <div className="card text-center py-16">
          <CalendarDays className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">Du hast noch keine Veranstaltungen erstellt.</p>
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Erste Veranstaltung erstellen
          </Button>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Titel</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Kategorie</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Datum</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Anmeldungen</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {data.data.map((event) => (
                <EventManagerRow
                  key={event.id}
                  event={event}
                  onEdit={(id) => setEditingEventId(id)}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button variant="outline" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
            {t('eventsPage.paginationPrev')}
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('eventsPage.paginationPage', { page, total: data.meta.totalPages })}
          </span>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={page >= data.meta.totalPages}>
            {t('eventsPage.paginationNext')}
          </Button>
        </div>
      )}

      <EventFormModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <EditEventModal eventId={editingEventId} onClose={() => setEditingEventId(null)} />
    </div>
  );
}

function EventManagerRow({
  event,
  onEdit,
  onDelete,
}: {
  event: import('../types').AdminEvent;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{event.title}</td>
      <td className="px-4 py-3">
        <span
          className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
          style={{ backgroundColor: event.category?.color }}
        >
          {event.category?.name}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
        {format(new Date(event.startDate), 'd. MMM yyyy', { locale: de })}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
        {event._count.registrations}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(event.id)}
            aria-label={`${event.title} bearbeiten`}
            className="text-primary-500 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
          </Button>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => onDelete(event.id)} className="text-red-600 hover:text-red-700 text-xs">
                Ja
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)} className="text-xs">
                Nein
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              aria-label={`${event.title} löschen`}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
