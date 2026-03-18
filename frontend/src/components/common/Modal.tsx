import { ReactNode } from 'react';
import FocusTrap from 'focus-trap-react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  children: ReactNode;
  size?: ModalSize;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-4xl',
};

export default function Modal({ isOpen, onClose, title, titleId, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <FocusTrap active={isOpen} focusTrapOptions={{ returnFocusOnDeactivate: true, escapeDeactivates: false }}>
      <div>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity cursor-pointer"
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h2 id={titleId} className="text-xl font-bold text-gray-900 dark:text-white truncate pr-4">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 flex-shrink-0"
                aria-label="Schließen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
