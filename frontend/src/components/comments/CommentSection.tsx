import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '../../services/api';
import { CreateCommentInput } from '../../types';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import LoadingSpinner from '../common/LoadingSpinner';

interface CommentSectionProps {
  eventId: string;
}

export default function CommentSection({ eventId }: CommentSectionProps) {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // Fetch comments
  const { data: comments, isLoading, error } = useQuery({
    queryKey: ['comments', eventId],
    queryFn: () => commentsService.getByEventId(eventId),
  });

  // Create comment mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCommentInput) => commentsService.create(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', eventId] });
      setSubmitError(undefined);
    },
    onError: () => {
      setSubmitError('Kommentar konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.');
    },
  });

  // Delete comment mutation
  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => commentsService.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', eventId] });
      setDeletingCommentId(null);
    },
    onError: () => {
      setDeletingCommentId(null);
    },
  });

  const handleSubmit = (data: CreateCommentInput) => {
    createMutation.mutate(data);
  };

  const handleDelete = (commentId: string) => {
    if (window.confirm('Möchten Sie diesen Kommentar wirklich löschen?')) {
      setDeletingCommentId(commentId);
      deleteMutation.mutate(commentId);
    }
  };

  return (
    <section aria-labelledby="comments-heading" className="mt-8">
      <h2 
        id="comments-heading" 
        className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center"
      >
        <svg 
          className="w-5 h-5 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" 
          />
        </svg>
        Kommentare
        {comments && comments.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({comments.length})
          </span>
        )}
      </h2>

      {/* Comment Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Kommentar schreiben
        </h3>
        <CommentForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          error={submitError}
        />
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <LoadingSpinner label="Lade Kommentare..." />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">
              Kommentare konnten nicht geladen werden.
            </p>
          </div>
        ) : comments && comments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <svg 
              className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              Noch keine Kommentare vorhanden.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Seien Sie der Erste, der einen Kommentar hinterlässt!
            </p>
          </div>
        ) : (
          comments?.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={handleDelete}
              isDeleting={deletingCommentId === comment.id}
            />
          ))
        )}
      </div>
    </section>
  );
}
