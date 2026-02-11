import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      setError(t('loginPage.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
          {t('loginPage.title')}
        </h1>

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

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          {t('loginPage.noAccount')}{' '}
          <Link
            to="/register"
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            {t('loginPage.registerNow')}
          </Link>
        </p>
      </div>
    </div>
  );
}
