import React, { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: ModalProps) {
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={cn(
          'relative bg-popover text-popover-foreground',
          'rounded-2xl shadow-2xl',
          'max-w-lg w-full mx-4',
          'animate-scale-in',
          'border border-border/50',
          className
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            'absolute top-4 right-4',
            'p-1.5 rounded-lg',
            'text-muted-foreground hover:text-foreground',
            'hover:bg-accent',
            'transition-all duration-150',
            'active:scale-95'
          )}
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        {title && (
          <div className="px-6 pt-6 pb-4 border-b border-border/50">
            <h2 id="modal-title" className="text-lg font-semibold text-foreground tracking-tight">
              {title}
            </h2>
          </div>
        )}

        {/* Content */}
        <div className={cn('p-6', !title && 'pt-12')}>{children}</div>
      </div>
    </div>
  );
}
