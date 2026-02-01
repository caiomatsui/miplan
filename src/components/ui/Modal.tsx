/**
 * @deprecated This Modal component is deprecated.
 * Please use the new Dialog component from '@/components/ui/dialog' instead.
 *
 * Migration guide:
 * - Replace `isOpen` prop with `open`
 * - Replace `onClose` prop with `onOpenChange`
 * - Use `<DialogTitle>` inside `<DialogHeader>` instead of the `title` prop
 * - Wrap content in `<DialogContent>`
 *
 * Example:
 * ```tsx
 * import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 *
 * <Dialog open={isOpen} onOpenChange={onClose}>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>My Title</DialogTitle>
 *     </DialogHeader>
 *     {children}
 *   </DialogContent>
 * </Dialog>
 * ```
 *
 * This file will be removed in a future version.
 */
import React, { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
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
          'border border-border',
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
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>

        {/* Header */}
        {title && (
          <div className="px-6 pt-6 pb-4 border-b border-border">
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
