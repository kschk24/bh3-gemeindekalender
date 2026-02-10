import { useTranslation } from 'react-i18next';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  label,
}: LoadingSpinnerProps) {
  const { t } = useTranslation();
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const labelText = label ?? t('loading');

  return (
    <div className="flex flex-col items-center justify-center p-8" role="status">
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full animate-spin`}
        aria-hidden="true"
      />
      <span className="sr-only">{labelText}</span>
      <p className="mt-2 text-gray-600 dark:text-gray-400">{labelText}</p>
    </div>
  );
}
