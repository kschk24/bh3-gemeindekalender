import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import { useTranslation } from 'react-i18next';

interface CommentFormProps {
  onSubmit: (data: { content: string; guestName?: string }) => void;
  isSubmitting?: boolean;
  error?: string;
}

export default function CommentForm({ onSubmit, isSubmitting, error }: CommentFormProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    onSubmit({
      content: content.trim(),
      guestName: isAuthenticated ? undefined : guestName.trim() || undefined,
    });
    
    // Clear form on success (parent will handle the actual success state)
    setContent('');
  };

  const isValid = content.trim().length > 0 && (isAuthenticated || guestName.trim().length > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isAuthenticated && (
        <Input
          label={t('comment.guest') === 'Gast' ? 'Ihr Name' : t('event.form.name')}
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder={t('comment.guest') === 'Gast' ? 'Max Mustermann' : ''}
          required
          disabled={isSubmitting}
        />
      )}

      <div>
        <label 
          htmlFor="comment-content" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('comment.yourComment')}
        </label>
        <textarea
          id="comment-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('comment.placeholder')}
          rows={4}
          maxLength={2000}
          required
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     placeholder-gray-400 dark:placeholder-gray-500
                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                     disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
                     resize-none transition-colors"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
          {t('comment.charCount', { count: content.length })}
        </p>
      </div>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        {!isAuthenticated && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('comment.tip')}
          </p>
        )}
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          isLoading={isSubmitting}
          className="ml-auto"
        >
          {t('comment.submit')}
        </Button>
      </div>
    </form>
  );
}
