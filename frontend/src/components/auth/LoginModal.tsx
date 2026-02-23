import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import { useTranslation } from 'react-i18next';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({ isOpen, onClose, triggerRef, onSwitchToRegister }: LoginModalProps) {
  const { login } = useAuth();
  const { t } = useTranslation();

  const modalRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  // Close modal on Escape key or click outside the panel
  useEffect(() => {
    const handleKeyOrClick = (e: KeyboardEvent | MouseEvent) => {
      if (!isOpen) return;
      if (e instanceof KeyboardEvent) {
        if (e.key === 'Escape') onClose();
      } else {
        if (
          modalRef.current && !modalRef.current.contains(e.target as Node) &&
          !(triggerRef?.current && triggerRef.current.contains(e.target as Node))
        ) {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyOrClick as EventListener);
    document.addEventListener('mousedown', handleKeyOrClick as EventListener);
    return () => {
      document.removeEventListener('keydown', handleKeyOrClick as EventListener);
      document.removeEventListener('mousedown', handleKeyOrClick as EventListener);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      onClose();
    } catch {
      setError(t('loginPage.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - pointer-events: none so cursors still react to elements beneath */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity pointer-events-none"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed top-[4.5rem] right-4 lg:right-16 z-50 w-full max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[calc(100vh-5rem)] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2
              id="login-modal-title"
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              {t('loginPage.title')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded-lg text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <Input
                label={t('loginPage.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Input
                label={t('loginPage.password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {t('auth.login')}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              {t('loginPage.noAccount')}{' '}
              <button
                type="button"
                onClick={() => { onClose(); onSwitchToRegister?.(); }}
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                {t('loginPage.registerNow')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
