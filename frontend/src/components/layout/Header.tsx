import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../accessibility/ThemeToggle';
import AccessibilityMenu from '../accessibility/AccessibilityMenu';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  return (
    <header
      className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
      role="banner"
    >
      <nav
        className="container mx-auto px-4 py-4"
        role="navigation"
        aria-label="Hauptnavigation"
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold text-primary-600 dark:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
          >
            Gemeindekalender
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/" className={navLinkClass} end>
              Startseite
            </NavLink>
            <NavLink to="/events" className={navLinkClass}>
              Veranstaltungen
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/favorites" className={navLinkClass}>
                Favoriten
              </NavLink>
            )}
          </div>

          {/* Right side: Accessibility + Auth */}
          <div className="flex items-center space-x-4">
            <AccessibilityMenu />
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                  {user?.email}
                </span>
                <button
                  onClick={logout}
                  className="btn btn-secondary text-sm"
                  aria-label="Abmelden"
                >
                  Abmelden
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn btn-secondary text-sm">
                  Anmelden
                </Link>
                <Link to="/register" className="btn btn-primary text-sm">
                  Registrieren
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 flex flex-wrap gap-2">
          <NavLink to="/" className={navLinkClass} end>
            Startseite
          </NavLink>
          <NavLink to="/events" className={navLinkClass}>
            Veranstaltungen
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/favorites" className={navLinkClass}>
              Favoriten
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}
