import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

/**
 * Hook that configures drag-and-drop sensors for mouse, touch, and keyboard.
 * - PointerSensor: For mouse with 8px activation distance to prevent accidental drags
 * - TouchSensor: For touch devices with 8px activation and 250ms delay
 * - KeyboardSensor: For accessibility with sortable keyboard coordinates
 */
export function useDragSensors() {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevents accidental drags
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
}
