import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types';
import { TaskTitle } from './TaskTitle';
import { TaskActions } from './TaskActions';
import { TaskTimer } from './TaskTimer';
import { PriorityBadge, getPriorityBorderClass } from './PriorityBadge';
import { LabelBadge } from './LabelBadge';
import { useTaskActions } from '../../hooks/useTasks';
import { useTaskLabels } from '../../hooks/useLabels';
import { useTimer } from '../../hooks/useTimer';
import { useUIStore } from '../../store';
import { debounce } from '../../utils/debounce';
import { hasUrl, linkifyText } from '../../utils/url';
import { formatTime, calculateElapsedTime } from '../../utils/time';
import { cn } from '@/lib/utils';
import { Link2 } from 'lucide-react';

const MAX_VISIBLE_LABELS = 3;

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  isNew?: boolean;
  onTaskDeleted?: () => void;
}

export function TaskCard({ task, isDragging, isNew = false, onTaskDeleted }: TaskCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(isNew);
  const [hasAnimated, setHasAnimated] = useState(!isNew);

  useEffect(() => {
    if (isNew && !hasAnimated) {
      const timer = setTimeout(() => setHasAnimated(true), 350);
      return () => clearTimeout(timer);
    }
  }, [isNew, hasAnimated]);

  const { updateTask, deleteTask } = useTaskActions();
  const { activeTimerTaskId } = useTimer();
  const setSelectedTask = useUIStore((state) => state.setSelectedTask);
  const taskLabels = useTaskLabels(task.id);

  const isTimerActive = activeTimerTaskId === task.id;
  const hasTrackedTime = task.timeSpent > 0 || task.timerStartedAt !== null;

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

  const debouncedSaveTitle = useMemo(
    () =>
      debounce((title: string) => {
        updateTask(task.id, { title });
      }, 300),
    [task.id, updateTask]
  );

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
    if (isEditingTitle) return;
    setSelectedTask(task.id);
  }, [isEditingTitle, setSelectedTask, task.id]);

  const handleStartEditTitle = useCallback(() => {
    setIsEditingTitle(true);
  }, []);

  const taskHasLink = hasUrl(task.title) || hasUrl(task.description || '');
  const priorityBorderClass = getPriorityBorderClass(task.priority);

  return (
    <div
      data-task
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isEditingTitle ? {} : listeners)}
      onClick={handleCardClick}
      className={cn(
        // Base styles - Glassmorphism
        'group relative rounded-xl overflow-hidden',
        'bg-card/80 backdrop-blur-md',
        'border border-white/20 dark:border-white/10',
        'text-card-foreground',
        'min-h-[56px] select-none',
        // Padding
        'px-3 py-2.5',
        // Enhanced shadows with multi-layer soft shadows
        'shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]',
        'transition-all duration-150 ease-out',
        // Cursor states
        isEditingTitle ? 'cursor-default' : 'cursor-pointer',
        // Hover state - Glow effect
        !dragging && 'hover:shadow-[0_4px_20px_rgba(0,0,0,0.08),0_0_0_1px_rgba(99,102,241,0.1)] hover:-translate-y-0.5 hover:border-primary/30',
        // Drag state
        dragging && 'shadow-card-drag scale-[1.02] rotate-1 z-50 cursor-grabbing ring-2 ring-primary/20',
        // Priority border accent
        priorityBorderClass,
        // New task animation
        isNew && !hasAnimated && 'animate-task-appear'
      )}
    >
      {/* Priority Badge - top right, offset for action buttons */}
      {task.priority !== 'none' && (
        <div className="absolute top-2 right-14 z-10">
          <PriorityBadge priority={task.priority} size="sm" showLabel={false} />
        </div>
      )}

      {/* Link indicator */}
      {taskHasLink && (
        <span
          className="absolute top-2.5 right-20 text-muted-foreground/60"
          title="Contains link"
        >
          <Link2 className="h-3.5 w-3.5" />
        </span>
      )}

      {/* Task Actions - slide in from right on hover */}
      <div className={cn(
        'absolute top-1.5 right-0 pr-1.5',
        'translate-x-full opacity-0',
        'group-hover:translate-x-0 group-hover:opacity-100',
        'transition-all duration-150 ease-out',
        dragging && 'hidden'
      )}>
        <TaskActions taskId={task.id} />
      </div>

      {/* Title - adds padding on hover to make room for buttons */}
      <div className={cn(
        'transition-[padding] duration-150 ease-out',
        'group-hover:pr-[4.5rem]'
      )}>
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
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
          {linkifyText(task.description)}
        </p>
      )}

      {/* Metadata row: Labels + Timer */}
      {(visibleLabels.length > 0 || hasTrackedTime || isTimerActive) && (
        <div className="flex items-center justify-between gap-2 mt-2.5">
          {/* Labels */}
          {visibleLabels.length > 0 ? (
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {visibleLabels.map((label) => (
                <LabelBadge key={label.id} name={label.name} color={label.color} size="sm" />
              ))}
              {overflowCount > 0 && (
                <span className="text-[10px] text-muted-foreground font-medium">+{overflowCount}</span>
              )}
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Timer */}
          <div
            className={cn(
              'flex-shrink-0 transition-opacity duration-150',
              hasTrackedTime || isTimerActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}
          >
            <TaskTimer task={task} showResetButton={false} />
          </div>
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
  const priorityBorderClass = getPriorityBorderClass(task.priority);

  return (
    <div
      className={cn(
        'relative bg-card text-card-foreground rounded-xl overflow-hidden',
        'px-3 py-2.5 min-h-[56px] select-none',
        'shadow-card-drag border border-primary/30',
        'scale-[1.03] rotate-2',
        'ring-2 ring-primary/30',
        priorityBorderClass
      )}
    >
      {task.priority !== 'none' && (
        <div className="absolute top-2 right-2">
          <PriorityBadge priority={task.priority} size="sm" showLabel={false} />
        </div>
      )}
      <p className="text-sm font-medium leading-snug pr-8">{task.title}</p>
      {task.description && (
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
          {task.description}
        </p>
      )}
      {hasTime && (
        <p className="text-xs text-muted-foreground mt-1.5 font-mono tabular-nums">
          {formatTime(calculateElapsedTime(task.timeSpent, task.timerStartedAt))}
        </p>
      )}
    </div>
  );
}
