import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/accessibility/LanguageSwitcher';

// Icon components for navigation
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
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
        `flex flex-col items-center px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
          highlighted
            ? 'bg-yellow-400 text-primary-800 border-2 border-yellow-500'
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
              <NavItem to="/events" icon={<CalendarIcon />} label={t('nav.events')} />
              <NavItem to="/" icon={<HomeIcon />} label={t('nav.home')} />
              {isAuthenticated && (
                <NavItem to="/favorites" icon={<StarIcon />} label={t('nav.favorites')} highlighted />
              )}
              <NavItem to="/info" icon={<InfoIcon />} label={t('nav.info')} />
            </nav>

            {/* Auth buttons */}
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <>
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
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                  >
                    {t('auth.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    {t('auth.register')}
                  </Link>
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
          <NavItem to="/info" icon={<InfoIcon />} label={t('nav.info')} />
        </div>
      </nav>
    </header>
  );
}
