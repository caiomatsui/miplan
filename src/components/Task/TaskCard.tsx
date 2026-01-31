import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types';
import { TaskTitle } from './TaskTitle';
import { TaskDescription } from './TaskDescription';
import { TaskActions } from './TaskActions';
import { TaskTimer } from './TaskTimer';
import { useTaskActions } from '../../hooks/useTasks';
import { useTimer } from '../../hooks/useTimer';
import { debounce } from '../../utils/debounce';
import { hasUrl, linkifyText } from '../../utils/url';
import { formatTime, calculateElapsedTime } from '../../utils/time';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  isNew?: boolean;
  onTaskDeleted?: () => void;
}

export function TaskCard({ task, isDragging, isNew = false, onTaskDeleted }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(isNew);
  const { updateTask, deleteTask } = useTaskActions();
  const { activeTimerTaskId } = useTimer();

  // Check if this task has an active timer
  const isTimerActive = activeTimerTaskId === task.id;
  // Check if task has any tracked time
  const hasTrackedTime = task.timeSpent > 0 || task.timerStartedAt !== null;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
      columnId: task.columnId,
    },
    disabled: isEditingTitle,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const dragging = isDragging || isSortableDragging;

  // Create debounced save functions
  const debouncedSaveTitle = useMemo(
    () =>
      debounce((title: string) => {
        updateTask(task.id, { title });
      }, 300),
    [task.id, updateTask]
  );

  const debouncedSaveDescription = useMemo(
    () =>
      debounce((description: string) => {
        updateTask(task.id, { description });
      }, 300),
    [task.id, updateTask]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSaveTitle.cancel();
      debouncedSaveDescription.cancel();
    };
  }, [debouncedSaveTitle, debouncedSaveDescription]);

  const handleTitleSave = useCallback(
    (title: string) => {
      debouncedSaveTitle.cancel();
      updateTask(task.id, { title });
      setIsEditingTitle(false);
    },
    [task.id, updateTask, debouncedSaveTitle]
  );

  const handleTitleCancel = useCallback(() => {
    // If this is a new task with no title, delete it
    if (isNew && !task.title.trim()) {
      deleteTask(task.id);
      onTaskDeleted?.();
    }
    setIsEditingTitle(false);
  }, [isNew, task.title, task.id, deleteTask, onTaskDeleted]);

  const handleDelete = useCallback(async () => {
    await deleteTask(task.id);
    onTaskDeleted?.();
  }, [task.id, deleteTask, onTaskDeleted]);

  const handleDescriptionChange = useCallback(
    (description: string) => {
      debouncedSaveDescription(description);
    },
    [debouncedSaveDescription]
  );

  const handleCardClick = useCallback(
    () => {
      // Don't expand/collapse if we're editing the title
      if (isEditingTitle) return;

      // Toggle expand state
      setIsExpanded((prev) => !prev);
    },
    [isEditingTitle]
  );

  const handleStartEditTitle = useCallback(() => {
    setIsEditingTitle(true);
  }, []);

  // Check if task has any URLs in title or description
  const taskHasLink = hasUrl(task.title) || hasUrl(task.description || '');

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isEditingTitle ? {} : listeners)}
      onClick={handleCardClick}
      className={`
        group relative
        bg-white rounded-lg p-3 shadow-sm border border-gray-200
        ${isEditingTitle ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
        min-h-[60px] select-none
        hover:shadow-md hover:border-gray-300
        transition-all duration-150
        ${dragging ? 'shadow-lg scale-105 rotate-2 z-50' : ''}
        ${isExpanded ? 'ring-2 ring-blue-200' : ''}
      `}
    >
      {/* Link indicator - shown when task contains URLs */}
      {taskHasLink && (
        <span
          className="absolute top-2 right-8 text-sm opacity-70"
          title="Contains link"
        >
          <span role="img" aria-label="link">&#128279;</span>
        </span>
      )}

      {/* Task Actions - visible on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <TaskActions taskId={task.id} />
      </div>

      <div className="pr-6">
        <TaskTitle
          task={task}
          isEditing={isEditingTitle}
          onStartEdit={handleStartEditTitle}
          onSave={handleTitleSave}
          onCancel={handleTitleCancel}
          onDelete={handleDelete}
        />
      </div>

      {/* Collapsed description preview */}
      {!isExpanded && task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{linkifyText(task.description)}</p>
      )}

      {/* Timer - collapsed view: show on hover or when has time/active */}
      {!isExpanded && (
        <div className={`mt-2 ${hasTrackedTime || isTimerActive ? 'block' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
          <TaskTimer task={task} showResetButton={false} />
        </div>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-2 space-y-3">
          {/* Timer with reset button in expanded view */}
          <div className="pt-2 border-t border-gray-100">
            <TaskTimer task={task} showResetButton={true} />
          </div>

          {/* Description editor */}
          <TaskDescription
            description={task.description}
            onChange={handleDescriptionChange}
          />
        </div>
      )}
    </div>
  );
}

interface TaskCardOverlayProps {
  task: Task;
}

export function TaskCardOverlay({ task }: TaskCardOverlayProps) {
  const hasTime = task.timeSpent > 0 || task.timerStartedAt !== null;

  return (
    <div
      className="
        bg-white rounded-lg p-3 shadow-lg border border-blue-300
        min-h-[60px] select-none
        scale-105 rotate-2
        ring-2 ring-blue-400 ring-opacity-50
      "
    >
      <p className="text-sm text-gray-800 font-medium leading-snug">
        {task.title}
      </p>
      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}
      {hasTime && (
        <p className="text-xs text-gray-500 mt-1 font-mono">
          {formatTime(calculateElapsedTime(task.timeSpent, task.timerStartedAt))}
        </p>
      )}
    </div>
  );
}
