import { useState, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Plus, ShieldCheck, CalendarDays } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Role } from '../../types';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import EventFormModal from '../events/EventFormModal';

// Icon components for navigation
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  highlighted?: boolean;
}

function NavItem({ to, icon, label, highlighted }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2 dark:focus:ring-white dark:focus:ring-offset-gray-900 ${
          highlighted
            ? 'bg-yellow-400 text-primary-800'
            : isActive
            ? 'bg-primary-600 text-white'
            : 'bg-primary-500 text-white hover:bg-primary-600'
        }`
      }
    >
      <div className="mb-1">{icon}</div>
      <span className="text-xs font-medium whitespace-nowrap">{label}</span>
    </NavLink>
  );
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const registerButtonRef = useRef<HTMLButtonElement>(null);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);

  const canManageEvents = user?.role === Role.ADMIN || user?.role === Role.EVENT_MANAGER;
  const isAdmin = user?.role === Role.ADMIN;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm" role="banner">
      {/* Top bar with logo and auth */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            >
              <span className="text-2xl font-bold">
                <span className="text-primary-500">Gemeinde</span>
                <span className="text-gray-800 dark:text-white">kalender</span>
              </span>
            </Link>

            {/* Icon Navigation - Desktop */}
            <nav
              className="hidden md:flex items-center space-x-2"
              role="navigation"
              aria-label="Hauptnavigation"
            >
              <NavItem to="/" icon={<HomeIcon />} label={t('nav.home')} />
              <NavItem to="/events" icon={<CalendarIcon />} label={t('nav.events')} />
              {isAuthenticated && (
                <NavItem to="/favorites" icon={<StarIcon />} label={t('nav.favorites')} highlighted />
              )}
              {canManageEvents && (
                <NavItem to="/my-events" icon={<CalendarDays className="w-8 h-8" aria-hidden="true" />} label="Meine Events" />
              )}
              {isAdmin && (
                <NavItem to="/admin" icon={<ShieldCheck className="w-8 h-8" aria-hidden="true" />} label={t('nav.admin')} />
              )}
            </nav>

            {/* Auth buttons */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  {canManageEvents && (
                    <button
                      onClick={() => setIsEventFormOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-primary-500 rounded hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      aria-label={t('nav.createEvent')}
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline">{t('nav.createEvent')}</span>
                    </button>
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400 hidden lg:inline">
                    {user?.email}
                  </span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Abmelden"
                  >
                    {t('auth.logout')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    ref={loginButtonRef}
                    onClick={() => setIsLoginModalOpen(prev => !prev)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                  >
                    {t('auth.login')}
                  </button>
                  <button
                    ref={registerButtonRef}
                    onClick={() => setIsRegisterModalOpen(prev => !prev)}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    {t('auth.register')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav
        className="md:hidden bg-primary-500 px-4 py-2"
        role="navigation"
        aria-label="Mobile Navigation"
      >
          <div className="flex items-center justify-around">
          <NavItem to="/events" icon={<CalendarIcon />} label={t('nav.events')} />
          <NavItem to="/" icon={<HomeIcon />} label={t('nav.home')} />
          {isAuthenticated && (
            <NavItem to="/favorites" icon={<StarIcon />} label={t('nav.favorites')} />
          )}
          {canManageEvents && (
            <NavItem to="/my-events" icon={<CalendarDays className="w-8 h-8" aria-hidden="true" />} label="Meine Events" />
          )}
          {isAdmin && (
            <NavItem to="/admin" icon={<ShieldCheck className="w-8 h-8" aria-hidden="true" />} label={t('nav.admin')} />
          )}
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        triggerRef={loginButtonRef}
        onSwitchToRegister={() => setIsRegisterModalOpen(true)}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        triggerRef={registerButtonRef}
        onSwitchToLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Event Form Modal */}
      {canManageEvents && (
        <EventFormModal
          isOpen={isEventFormOpen}
          onClose={() => setIsEventFormOpen(false)}
        />
      )}
    </header>
  );
}
