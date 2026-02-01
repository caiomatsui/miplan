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
      className="fixed z-50"
      style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute animate-fade-in"
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Sheet Panel */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        className={cn(
          'absolute top-0 h-full',
          'flex flex-col',
          'focus:outline-none',
          side === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left',
          className
        )}
        style={{
          width: '100%',
          maxWidth: '420px',
          [side === 'right' ? 'right' : 'left']: 0,
          backgroundColor: 'var(--sheet-bg)',
          borderLeft: side === 'right' ? '1px solid var(--sheet-border)' : 'none',
          borderRight: side === 'left' ? '1px solid var(--sheet-border)' : 'none',
          boxShadow: side === 'right'
            ? '-4px 0 25px rgba(0, 0, 0, 0.25), -1px 0 10px rgba(0, 0, 0, 0.15)'
            : '4px 0 25px rgba(0, 0, 0, 0.25), 1px 0 10px rgba(0, 0, 0, 0.15)',
        }}
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
    <div className={cn('flex items-center justify-between px-5 py-4 border-b border-border/50', className)}>
      <div className="flex-1 min-w-0">{children}</div>
      <button
        onClick={onClose}
        className={cn(
          'ml-2 p-2 rounded-lg flex-shrink-0',
          'text-muted-foreground hover:text-foreground',
          'hover:bg-accent',
          'transition-all duration-150',
          'active:scale-95'
        )}
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
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
  return <div className={cn('flex-1 overflow-y-auto px-5 py-4', className)}>{children}</div>;
}

interface SheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetFooter({ children, className }: SheetFooterProps) {
  return <div className={cn('px-5 py-4 border-t border-border/50 bg-muted/30', className)}>{children}</div>;
}
