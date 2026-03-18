import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Trash2, ShieldCheck, Users, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import { Role, type AdminUser, type AdminEvent } from '../types';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ROLE_LABELS: Record<Role, string> = {
  [Role.USER]: 'Benutzer',
  [Role.EVENT_MANAGER]: 'Veranstaltungsmanager',
  [Role.ADMIN]: 'Admin',
};


function UserRow({ user, onRoleChange, onDelete }: {
  user: AdminUser;
  onRoleChange: (id: string, role: Role) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{user.email}</td>
      <td className="px-4 py-3">
        <select
          value={user.role}
          onChange={(e) => onRoleChange(user.id, e.target.value as Role)}
          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label={`Rolle für ${user.email}`}
        >
          {Object.values(Role).map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
        {format(new Date(user.createdAt), 'd. MMM yyyy', { locale: de })}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
        {user._count.comments} / {user._count.favorites}
      </td>
      <td className="px-4 py-3">
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-700 text-xs">
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
            aria-label={`${user.email} löschen`}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </Button>
        )}
      </td>
    </tr>
  );
}

function EventRow({ event, onDelete }: { event: AdminEvent; onDelete: (id: string) => void }) {
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
      </td>
    </tr>
  );
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'users' | 'events'>('users');
  const [userPage, setUserPage] = useState(1);
  const [eventPage, setEventPage] = useState(1);

  // All hooks must come before any early returns
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users', userPage],
    queryFn: () => adminService.getUsers(userPage),
    enabled: !authLoading && user?.role === Role.ADMIN && tab === 'users',
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['admin', 'events', eventPage],
    queryFn: () => adminService.getEvents(eventPage),
    enabled: !authLoading && user?.role === Role.ADMIN && tab === 'events',
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => adminService.changeUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(t('admin.users.roleChanged'));
    },
    onError: () => toast.error(t('error.generic')),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(t('admin.users.deleteSuccess'));
    },
    onError: () => toast.error(t('error.generic')),
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      toast.success(t('admin.events.deleteSuccess'));
    },
    onError: () => toast.error(t('error.generic')),
  });

  if (authLoading) return <LoadingSpinner />;
  if (user?.role !== Role.ADMIN) return <Navigate to="/" replace />;

  const tabClass = (active: boolean) =>
    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
      active
        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
    }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-7 h-7 text-primary-600" aria-hidden="true" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.title')}</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          <button className={tabClass(tab === 'users')} onClick={() => setTab('users')} aria-selected={tab === 'users'}>
            <Users className="w-4 h-4" aria-hidden="true" />
            {t('admin.tabs.users')}
            {usersData && (
              <span className="ml-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                {usersData.meta.total}
              </span>
            )}
          </button>
          <button className={tabClass(tab === 'events')} onClick={() => setTab('events')} aria-selected={tab === 'events'}>
            <CalendarDays className="w-4 h-4" aria-hidden="true" />
            {t('admin.tabs.events')}
            {eventsData && (
              <span className="ml-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                {eventsData.meta.total}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div>
          {usersLoading ? (
            <LoadingSpinner label={t('loading')} />
          ) : (
            <div className="card overflow-hidden p-0">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('admin.users.email')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('admin.users.role')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">{t('admin.users.joined')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Kommentare / Favoriten</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('admin.users.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900">
                  {usersData?.data.map((u) => (
                    <UserRow
                      key={u.id}
                      user={u}
                      onRoleChange={(id, role) => changeRoleMutation.mutate({ id, role })}
                      onDelete={(id) => deleteUserMutation.mutate(id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {usersData && usersData.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" onClick={() => setUserPage((p) => p - 1)} disabled={userPage <= 1}>
                {t('eventsPage.paginationPrev')}
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('eventsPage.paginationPage', { page: userPage, total: usersData.meta.totalPages })}
              </span>
              <Button variant="outline" onClick={() => setUserPage((p) => p + 1)} disabled={userPage >= usersData.meta.totalPages}>
                {t('eventsPage.paginationNext')}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Events Tab */}
      {tab === 'events' && (
        <div>
          {eventsLoading ? (
            <LoadingSpinner label={t('loading')} />
          ) : (
            <div className="card overflow-hidden p-0">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('admin.events.title')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('admin.events.category')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">{t('admin.events.date')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">{t('admin.events.registrations')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('admin.users.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900">
                  {eventsData?.data.map((e) => (
                    <EventRow
                      key={e.id}
                      event={e}
                      onDelete={(id) => deleteEventMutation.mutate(id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {eventsData && eventsData.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" onClick={() => setEventPage((p) => p - 1)} disabled={eventPage <= 1}>
                {t('eventsPage.paginationPrev')}
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('eventsPage.paginationPage', { page: eventPage, total: eventsData.meta.totalPages })}
              </span>
              <Button variant="outline" onClick={() => setEventPage((p) => p + 1)} disabled={eventPage >= eventsData.meta.totalPages}>
                {t('eventsPage.paginationNext')}
              </Button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
