import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Star, Download, Trash2, CalendarDays, ShieldCheck, Upload, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { favoritesService, usersService } from '../services/api';
import { Role } from '../types';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UserAvatar from '../components/common/UserAvatar';

// Preset emoji icons to choose from
const PRESET_ICONS = ['🦊', '🐻', '🦁', '🐼', '🦋', '🌺', '🎭', '🚀', '🎸', '⚡', '🌙', '🎨'];

function RoleBadge({ role }: { role: Role }) {
  const { t } = useTranslation();
  const config: Record<Role, { label: string; className: string }> = {
    [Role.ADMIN]: {
      label: t('profile.roles.admin'),
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
    [Role.EVENT_MANAGER]: {
      label: t('profile.roles.eventManager'),
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    [Role.USER]: {
      label: t('profile.roles.user'),
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
  };
  const { label, className } = config[role];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function resizeImageToBase64(file: File, maxSize = 128): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/webp', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/');
  }, [authLoading, isAuthenticated, navigate]);

  const { data: favorites, isLoading: favLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesService.getAll,
    enabled: isAuthenticated,
  });

  const saveAvatar = async (avatar: string | null) => {
    setIsSavingAvatar(true);
    setAvatarError('');
    try {
      const updated = await usersService.updateAvatar(avatar);
      updateUser({ avatar: updated.avatar });
    } catch {
      setAvatarError(t('profile.avatar.error'));
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError(t('profile.avatar.invalidType'));
      return;
    }
    try {
      const base64 = await resizeImageToBase64(file);
      await saveAvatar(base64);
    } catch {
      setAvatarError(t('profile.avatar.error'));
    }
    // reset so same file can be selected again
    e.target.value = '';
  };

  const handleExport = async () => {
    setIsExporting(true);
    try { await usersService.exportData(); }
    finally { setIsExporting(false); }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await usersService.deleteAccount();
      await logout();
      navigate('/');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (authLoading || !user) {
    return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  }

  const memberSince = format(
    new Date(user.createdAt),
    'd. MMMM yyyy',
    { locale: i18n.language === 'de' ? de : enUS }
  );
  const canManageEvents = user.role === Role.ADMIN || user.role === Role.EVENT_MANAGER;

  return (
    <main className="container mx-auto px-4 py-10 max-w-2xl" aria-labelledby="profile-heading">
      <h1 id="profile-heading" className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t('profile.title')}
      </h1>

      {/* Account info + Avatar */}
      <section className="card mb-6" aria-labelledby="account-heading">
        <h2 id="account-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('profile.accountInfo')}
        </h2>
        <div className="flex items-start gap-6">
          {/* Avatar display */}
          <div className="flex-shrink-0 relative">
            <UserAvatar user={user} size="lg" />
            {isSavingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            )}
          </div>

          <dl className="space-y-2 flex-1">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">{t('profile.email')}</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">{t('profile.role')}</dt>
              <dd className="mt-0.5"><RoleBadge role={user.role} /></dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">{t('profile.memberSince')}</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{memberSince}</dd>
            </div>
          </dl>
        </div>

        {/* Avatar picker */}
        <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('profile.avatar.change')}
          </p>

          {/* Preset emojis */}
          <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label={t('profile.avatar.presets')}>
            {PRESET_ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => saveAvatar(icon)}
                className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  user.avatar === icon
                    ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-500'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/50'
                }`}
                aria-label={icon}
                aria-pressed={user.avatar === icon}
                disabled={isSavingAvatar}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Upload + Reset row */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label={t('profile.avatar.upload')}
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSavingAvatar}
              className="flex items-center gap-1.5 text-sm"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              {t('profile.avatar.upload')}
            </Button>
            {user.avatar && (
              <Button
                variant="outline"
                onClick={() => saveAvatar(null)}
                disabled={isSavingAvatar}
                className="flex items-center gap-1.5 text-sm text-gray-500"
                aria-label={t('profile.avatar.remove')}
              >
                <X className="w-4 h-4" aria-hidden="true" />
                {t('profile.avatar.remove')}
              </Button>
            )}
          </div>
          {avatarError && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2" role="alert">{avatarError}</p>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="card mb-6" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('profile.activity')}
        </h2>
        <div className="flex gap-4">
          <Link
            to="/favorites"
            className="flex-1 flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Star className="w-6 h-6 text-yellow-500 mb-1" aria-hidden="true" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {favLoading ? '–' : (favorites?.length ?? 0)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('profile.favorites')}</span>
          </Link>
          {canManageEvents && (
            <Link
              to="/my-events"
              className="flex-1 flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {user.role === Role.ADMIN
                ? <ShieldCheck className="w-6 h-6 text-primary-500 mb-1" aria-hidden="true" />
                : <CalendarDays className="w-6 h-6 text-primary-500 mb-1" aria-hidden="true" />}
              <span className="text-sm text-center text-gray-500 dark:text-gray-400 mt-auto">
                {t('profile.myEvents')}
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* GDPR */}
      <section className="card" aria-labelledby="gdpr-heading">
        <h2 id="gdpr-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {t('profile.gdpr.title')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('profile.gdpr.description')}
        </p>
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={handleExport}
            isLoading={isExporting}
            className="w-full flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            {t('profile.gdpr.export')}
          </Button>
          {!deleteConfirm ? (
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              {t('profile.gdpr.delete')}
            </Button>
          ) : (
            <div
              className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4 space-y-3"
              role="alert"
            >
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {t('profile.gdpr.deleteConfirm')}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleDeleteAccount}
                  isLoading={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none"
                >
                  {t('profile.gdpr.deleteYes')}
                </Button>
                <Button variant="outline" onClick={() => setDeleteConfirm(false)} className="flex-1">
                  {t('profile.gdpr.deleteNo')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
