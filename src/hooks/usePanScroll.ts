import { useState, useEffect, useRef, RefObject, useCallback } from 'react';

interface UsePanScrollOptions {
  /** Whether pan scrolling is enabled (default: true) */
  enabled?: boolean;
  /** CSS cursor to show when ready to pan */
  cursorGrab?: string;
  /** CSS cursor to show when actively panning */
  cursorGrabbing?: string;
}

interface UsePanScrollReturn {
  /** Whether the user is currently panning */
  isPanning: boolean;
  /** Cursor to apply to container based on pan state */
  cursor: string;
}

/**
 * Checks if the event target is an interactive element or inside one
 * (e.g., buttons, inputs, tasks, columns)
 */
const isInteractiveElement = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof Element)) return false;

  // Check if click is on an interactive element
  const interactiveSelectors = [
    '[data-column]',
    '[data-task]',
    'button',
    'input',
    'textarea',
    'select',
    'a',
    '[role="button"]',
    '[draggable="true"]',
  ];

  return interactiveSelectors.some(selector =>
    target.matches(selector) || target.closest(selector)
  );
};

/**
 * Hook to enable pan-to-scroll functionality on a container.
 *
 * Supports:
 * - Middle-click + drag anywhere to pan
 * - Left-click + drag on empty space to pan
 *
 * @param containerRef - Ref to the scrollable container element
 * @param options - Configuration options
 */
export function usePanScroll(
  containerRef: RefObject<HTMLElement | null>,
  options: UsePanScrollOptions = {}
): UsePanScrollReturn {
  const {
    enabled = true,
    cursorGrab = 'grab',
    cursorGrabbing = 'grabbing',
  } = options;

  const [isPanning, setIsPanning] = useState(false);
  const startPos = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const isMiddleClick = useRef(false);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    // Middle click (button 1) - always pan
    if (e.button === 1) {
      e.preventDefault();
      isMiddleClick.current = true;
      setIsPanning(true);
      startPos.current = {
        x: e.pageX,
        y: e.pageY,
        scrollLeft: container.scrollLeft,
        scrollTop: container.scrollTop,
      };
      return;
    }

    // Left click (button 0) - only pan on empty space
    if (e.button === 0 && !isInteractiveElement(e.target)) {
      isMiddleClick.current = false;
      setIsPanning(true);
      startPos.current = {
        x: e.pageX,
        y: e.pageY,
        scrollLeft: container.scrollLeft,
        scrollTop: container.scrollTop,
      };
    }
  }, [containerRef, enabled]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;

    const container = containerRef.current;
    if (!container) return;

    e.preventDefault();

    const dx = e.pageX - startPos.current.x;
    const dy = e.pageY - startPos.current.y;

    container.scrollLeft = startPos.current.scrollLeft - dx;
    container.scrollTop = startPos.current.scrollTop - dy;
  }, [isPanning, containerRef]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    isMiddleClick.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Only stop panning if mouse leaves while panning
    if (isPanning) {
      setIsPanning(false);
      isMiddleClick.current = false;
    }
  }, [isPanning]);

  // Prevent default middle-click auto-scroll behavior
  const handleAuxClick = useCallback((e: MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    // Add event listeners
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('auxclick', handleAuxClick);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('auxclick', handleAuxClick);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef, enabled, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave, handleAuxClick]);

  return {
    isPanning,
    cursor: isPanning ? cursorGrabbing : cursorGrab,
  };
}
