import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { eventsService, favoritesService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useEventDetail } from '../../context/EventDetailContext';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import AccessibilityBadges from './AccessibilityBadges';
import CommentSection from '../comments/CommentSection';

export default function EventDetailModal() {
  const { eventId, closeEvent } = useEventDetail();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const isOpen = !!eventId;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setGuestName('');
      setGuestEmail('');
      setRegistrationSuccess(false);
    }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeEvent();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, closeEvent]);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsService.getById(eventId!),
    enabled: !!eventId,
  });

  const registerMutation = useMutation({
    mutationFn: () =>
      eventsService.register(eventId!, isAuthenticated ? {} : { guestName, guestEmail }),
    onSuccess: () => {
      setRegistrationSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: ({ add }: { add: boolean }) =>
      add ? favoritesService.add(eventId!) : favoritesService.remove(eventId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesService.getAll,
    enabled: isAuthenticated,
  });

  const isFavorited = !!favorites?.some((f) => f.id === event?.id);

  if (!isOpen) return null;

  const startDate = event ? new Date(event.startDate) : null;
  const endDate = event ? new Date(event.endDate) : null;
  const spotsLeft =
    event?.maxParticipants != null
      ? event.maxParticipants - (event._count?.registrations || 0)
      : null;

  return (
    <>
      {/* Backdrop – closes modal on click */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity cursor-pointer"
        aria-hidden="true"
        onClick={closeEvent}
      />

      {/* Modal wrapper – pointer-events-none so sidebar remains accessible */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-modal-title"
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col pointer-events-auto"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2
              id="event-detail-modal-title"
              className="text-xl font-bold text-gray-900 dark:text-white truncate pr-4"
            >
              {event?.title ?? ''}
            </h2>
            <button
              onClick={closeEvent}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 flex-shrink-0"
              aria-label={t('common.close')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto p-6 flex-1">
            {isLoading || !event || !startDate || !endDate ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner label={t('event.loadingEvent')} />
              </div>
            ) : (
              <article>
                {/* Header */}
                <header className="mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-3"
                        style={{ backgroundColor: event.category?.color }}
                      >
                        {event.category?.name}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                    </div>

                    {isAuthenticated && (
                      <Button
                        variant="outline"
                        onClick={() => favoriteMutation.mutate({ add: !isFavorited })}
                        disabled={favoriteMutation.isPending}
                        aria-label={isFavorited ? t('event.favoriteRemove', { title: event.title }) : t('event.favoriteAdd', { title: event.title })}
                        className="text-yellow-600 border-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-400 dark:hover:bg-yellow-900/20 flex-shrink-0 ml-4"
                      >
                        {isFavorited ? (
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        )}
                        {isFavorited ? t('event.marked') : t('event.mark')}
                      </Button>
                    )}
                  </div>
                </header>

                {/* Main Content */}
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Left: Details */}
                  <div className="md:col-span-2 space-y-6">
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt=""
                        className="w-full h-56 object-cover rounded-lg"
                        loading="lazy"
                      />
                    )}

                    <section aria-labelledby="desc-heading">
                      <h4 id="desc-heading" className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        {t('event.description')}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {event.description}
                      </p>
                    </section>

                    {event.accessibility && (
                      <section aria-labelledby="access-heading">
                        <h4 id="access-heading" className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                          {t('event.accessibility')}
                        </h4>
                        <AccessibilityBadges accessibility={event.accessibility} />
                      </section>
                    )}

                    <CommentSection eventId={eventId!} />
                  </div>

                  {/* Right: Info + Registration */}
                  <aside className="space-y-6">
                    {/* Info Card */}
                    <div className="card">
                      <h4 className="sr-only">{t('event.detailsTitle')}</h4>
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-sm text-gray-500 dark:text-gray-400">{t('event.dateTime')}</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {format(startDate, 'EEEE, d. MMMM yyyy', { locale: i18n.language === 'de' ? de : enUS })}
                            <br />
                            {format(startDate, 'HH:mm', { locale: i18n.language === 'de' ? de : enUS })} -{' '}
                            {format(endDate, 'HH:mm', { locale: i18n.language === 'de' ? de : enUS })} {t('event.timeUnit')}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500 dark:text-gray-400">{t('event.location')}</dt>
                          <dd className="font-medium text-gray-900 dark:text-white">
                            {event.location}
                            <br />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{event.address}</span>
                          </dd>
                        </div>
                        {spotsLeft !== null && (
                          <div>
                            <dt className="text-sm text-gray-500 dark:text-gray-400">{t('event.spotsAvailable')}</dt>
                            <dd className="font-medium text-gray-900 dark:text-white">
                              {spotsLeft > 0 ? t('event.spotsOf', { available: spotsLeft, total: event.maxParticipants }) : t('event.full')}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    {/* Registration */}
                    <div className="card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {t('event.register')}
                      </h4>

                      {registrationSuccess ? (
                        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded-lg" role="alert">
                          <p className="font-medium">{t('event.registeredSuccess')}</p>
                          <p className="text-sm mt-1">{t('event.registerConfirm')}</p>
                        </div>
                      ) : spotsLeft === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">{t('event.full')}</p>
                      ) : (
                        <form
                          onSubmit={(e) => { e.preventDefault(); registerMutation.mutate(); }}
                          className="space-y-4"
                        >
                          {event.requiresAccount && !isAuthenticated ? (
                            <p className="text-gray-600 dark:text-gray-400">
                              {t('event.pleaseLoginToRegisterPrefix')}{' '}
                              <button
                                type="button"
                                className="text-primary-600 hover:underline"
                                onClick={closeEvent}
                              >
                                {t('auth.login')}
                              </button>
                              {t('event.pleaseLoginToRegisterSuffix')}
                            </p>
                          ) : (
                            <>
                              {!isAuthenticated && (
                                <>
                                  <Input
                                    label={t('event.form.name')}
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    required
                                  />
                                  <Input
                                    label={t('event.form.email')}
                                    type="email"
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    required
                                  />
                                </>
                              )}
                              {registerMutation.isError && (
                                <p className="text-red-600 text-sm" role="alert">{t('error.generic')}</p>
                              )}
                              <Button type="submit" className="w-full" isLoading={registerMutation.isPending}>
                                {t('event.registerNow')}
                              </Button>
                            </>
                          )}
                        </form>
                      )}
                    </div>
                  </aside>
                </div>
              </article>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
