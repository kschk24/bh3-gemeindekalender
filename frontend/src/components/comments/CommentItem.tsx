import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { Comment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import { useTranslation } from 'react-i18next';

interface CommentItemProps {
  comment: Comment;
  onDelete?: (commentId: string) => void;
  isDeleting?: boolean;
}

export default function CommentItem({ comment, onDelete, isDeleting }: CommentItemProps) {
  const { user, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();

  // Determine display name
  const displayName = comment.user?.email || comment.guestName || t('comment.guest');
  
  // Check if current user can delete this comment
  const canDelete = isAuthenticated && (
    user?.id === comment.userId || 
    user?.role === 'ADMIN'
  );

  const locale = i18n.language === 'de' ? de : enUS;
  const formattedDate = format(new Date(comment.createdAt), "d. MMMM yyyy 'um' HH:mm 'Uhr'", {
    locale,
  });

  return (
    <article className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <header className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <span className="text-primary-600 dark:text-primary-400 text-sm font-medium">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {displayName}
                {comment.userId && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {t('comment.registered')}
                  </span>
                )}
            </p>
            <time 
              dateTime={comment.createdAt} 
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              {formattedDate}
            </time>
          </div>
        </div>

        {canDelete && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(comment.id)}
            disabled={isDeleting}
            aria-label={t('comment.deleteAria')}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
          </Button>
        )}
      </header>

      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm leading-relaxed">
        {comment.content}
      </p>
    </article>
  );
}
