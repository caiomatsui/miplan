import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
  className?: string;
}

export function Sheet({ open, onClose, children, side = 'right', className }: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Escape key handler
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Focus trap - focus the sheet when it opens
  useEffect(() => {
    if (open && sheetRef.current) {
      sheetRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />

      {/* Sheet Panel */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        className={cn(
          'absolute top-0 h-full bg-background border-l border-border shadow-lg flex flex-col',
          'w-full md:w-[400px]',
          'focus:outline-none',
          side === 'right' ? 'right-0 animate-slide-in-right' : 'left-0 animate-slide-in-left',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

interface SheetHeaderProps {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}

export function SheetHeader({ children, onClose, className }: SheetHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between p-4 border-b border-border', className)}>
      <div className="flex-1 min-w-0">{children}</div>
      <button
        onClick={onClose}
        className="ml-2 p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetContent({ children, className }: SheetContentProps) {
  return <div className={cn('flex-1 overflow-y-auto p-4', className)}>{children}</div>;
}

interface SheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetFooter({ children, className }: SheetFooterProps) {
  return <div className={cn('p-4 border-t border-border', className)}>{children}</div>;
}
