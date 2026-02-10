import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { eventsService, favoritesService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AccessibilityBadges from '../components/events/AccessibilityBadges';
import CommentSection from '../components/comments/CommentSection';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsService.getById(id!),
    enabled: !!id,
  });

  const registerMutation = useMutation({
    mutationFn: () =>
      eventsService.register(id!, isAuthenticated ? {} : { guestName, guestEmail }),
    onSuccess: () => {
      setRegistrationSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: () => favoritesService.add(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (isLoading) {
    return <LoadingSpinner label="Lade Veranstaltung..." />;
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Veranstaltung nicht gefunden
        </h1>
        <Link to="/events" className="text-primary-600 hover:underline">
          Zurück zu allen Veranstaltungen
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const spotsLeft = event.maxParticipants
    ? event.maxParticipants - (event._count?.registrations || 0)
    : null;

  return (
    <article className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <li>
            <Link to="/" className="hover:text-primary-600">
              Startseite
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/events" className="hover:text-primary-600">
              Veranstaltungen
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-gray-900 dark:text-white">
            {event.title}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <span
              className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-3"
              style={{ backgroundColor: event.category?.color }}
            >
              {event.category?.name}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {event.title}
            </h1>
          </div>

          {isAuthenticated && (
            <Button
              variant="outline"
              onClick={() => favoriteMutation.mutate()}
              disabled={favoriteMutation.isPending}
              aria-label="Zu Favoriten hinzufügen"
            >
              ❤️ Merken
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Image */}
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt=""
              className="w-full h-64 object-cover rounded-lg"
              loading="lazy"
            />
          )}

          {/* Description */}
          <section aria-labelledby="description-heading">
            <h2
              id="description-heading"
              className="text-xl font-semibold text-gray-900 dark:text-white mb-3"
            >
              Beschreibung
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {event.description}
            </p>
          </section>

          {/* Accessibility */}
          {event.accessibility && (
            <section aria-labelledby="accessibility-heading">
              <h2
                id="accessibility-heading"
                className="text-xl font-semibold text-gray-900 dark:text-white mb-3"
              >
                Barrierefreiheit
              </h2>
              <AccessibilityBadges accessibility={event.accessibility} />
            </section>
          )}

          {/* Comments */}
          <CommentSection eventId={id!} />
        </div>

        {/* Right: Info Card + Registration */}
        <aside className="space-y-6">
          {/* Info Card */}
          <div className="card">
            <h2 className="sr-only">Veranstaltungsdetails</h2>

            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">
                  Datum & Uhrzeit
                </dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {format(startDate, 'EEEE, d. MMMM yyyy', { locale: de })}
                  <br />
                  {format(startDate, 'HH:mm', { locale: de })} - {format(endDate, 'HH:mm', { locale: de })} Uhr
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Ort</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {event.location}
                  <br />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {event.address}
                  </span>
                </dd>
              </div>

              {spotsLeft !== null && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">
                    Verfügbare Plätze
                  </dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {spotsLeft > 0 ? `${spotsLeft} von ${event.maxParticipants}` : 'Ausgebucht'}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Registration */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Anmeldung
            </h2>

            {registrationSuccess ? (
              <div
                className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded-lg"
                role="alert"
              >
                <p className="font-medium">Erfolgreich angemeldet!</p>
                <p className="text-sm mt-1">
                  Sie erhalten eine Bestätigung per E-Mail.
                </p>
              </div>
            ) : spotsLeft === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                Diese Veranstaltung ist leider ausgebucht.
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  registerMutation.mutate();
                }}
                className="space-y-4"
              >
                {event.requiresAccount && !isAuthenticated ? (
                  <p className="text-gray-600 dark:text-gray-400">
                    Bitte{' '}
                    <Link to="/login" className="text-primary-600 hover:underline">
                      melden Sie sich an
                    </Link>
                    , um sich für diese Veranstaltung anzumelden.
                  </p>
                ) : (
                  <>
                    {!isAuthenticated && (
                      <>
                        <Input
                          label="Name"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          required
                        />
                        <Input
                          label="E-Mail"
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          required
                        />
                      </>
                    )}

                    {registerMutation.isError && (
                      <p className="text-red-600 text-sm" role="alert">
                        Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      isLoading={registerMutation.isPending}
                    >
                      Jetzt anmelden
                    </Button>
                  </>
                )}
              </form>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
