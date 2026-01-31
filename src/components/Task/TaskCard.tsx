import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types';
import { TaskTitle } from './TaskTitle';
import { TaskActions } from './TaskActions';
import { TaskTimer } from './TaskTimer';
import { PriorityBadge } from './PriorityBadge';
import { LabelBadge } from './LabelBadge';
import { useTaskActions } from '../../hooks/useTasks';
import { useTaskLabels } from '../../hooks/useLabels';
import { useTimer } from '../../hooks/useTimer';
import { useUIStore } from '../../store';
import { debounce } from '../../utils/debounce';
import { hasUrl, linkifyText } from '../../utils/url';
import { formatTime, calculateElapsedTime } from '../../utils/time';

const MAX_VISIBLE_LABELS = 5;

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  isNew?: boolean;
  onTaskDeleted?: () => void;
}

export function TaskCard({ task, isDragging, isNew = false, onTaskDeleted }: TaskCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(isNew);
  const { updateTask, deleteTask } = useTaskActions();
  const { activeTimerTaskId } = useTimer();
  const setSelectedTask = useUIStore((state) => state.setSelectedTask);
  const taskLabels = useTaskLabels(task.id);

  // Check if this task has an active timer
  const isTimerActive = activeTimerTaskId === task.id;
  // Check if task has any tracked time
  const hasTrackedTime = task.timeSpent > 0 || task.timerStartedAt !== null;

  // Labels display
  const visibleLabels = taskLabels?.slice(0, MAX_VISIBLE_LABELS) || [];
  const overflowCount = (taskLabels?.length || 0) - MAX_VISIBLE_LABELS;

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

  // Create debounced save function for title
  const debouncedSaveTitle = useMemo(
    () =>
      debounce((title: string) => {
        updateTask(task.id, { title });
      }, 300),
    [task.id, updateTask]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSaveTitle.cancel();
    };
  }, [debouncedSaveTitle]);

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

  const handleCardClick = useCallback(() => {
    // Don't open sheet if we're editing the title
    if (isEditingTitle) return;

    // Open task detail sheet
    setSelectedTask(task.id);
  }, [isEditingTitle, setSelectedTask, task.id]);

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
        bg-card text-card-foreground rounded-lg p-3 shadow-sm border border-border
        ${isEditingTitle ? 'cursor-default' : 'cursor-pointer'}
        min-h-[60px] select-none
        hover:shadow-md hover:border-ring
        transition-all duration-150
        ${dragging ? 'shadow-lg scale-105 rotate-2 z-50 cursor-grabbing' : ''}
      `}
    >
      {/* Priority Badge */}
      {task.priority !== 'none' && (
        <div className="absolute top-2 left-2 z-10">
          <PriorityBadge priority={task.priority} size="sm" />
        </div>
      )}

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

      <div className={`pr-6 ${task.priority !== 'none' ? 'pl-12' : ''}`}>
        <TaskTitle
          task={task}
          isEditing={isEditingTitle}
          onStartEdit={handleStartEditTitle}
          onSave={handleTitleSave}
          onCancel={handleTitleCancel}
          onDelete={handleDelete}
        />
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{linkifyText(task.description)}</p>
      )}

      {/* Labels */}
      {visibleLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {visibleLabels.map((label) => (
            <LabelBadge key={label.id} name={label.name} color={label.color} size="sm" />
          ))}
          {overflowCount > 0 && (
            <span className="text-xs text-muted-foreground">+{overflowCount}</span>
          )}
        </div>
      )}

      {/* Timer - show on hover or when has time/active */}
      <div className={`mt-2 ${hasTrackedTime || isTimerActive ? 'block' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
        <TaskTimer task={task} showResetButton={false} />
      </div>
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
        relative
        bg-card text-card-foreground rounded-lg p-3 shadow-lg border border-ring
        min-h-[60px] select-none
        scale-105 rotate-2
        ring-2 ring-ring ring-opacity-50
      "
    >
      {task.priority !== 'none' && (
        <div className="absolute top-2 left-2">
          <PriorityBadge priority={task.priority} size="sm" />
        </div>
      )}
      <p className={`text-sm font-medium leading-snug ${task.priority !== 'none' ? 'pl-12' : ''}`}>
        {task.title}
      </p>
      {task.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {task.description}
        </p>
      )}
      {hasTime && (
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          {formatTime(calculateElapsedTime(task.timeSpent, task.timerStartedAt))}
        </p>
      )}
    </div>
  );
}
