import { useState, useCallback, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Column as ColumnType, Task, Board, ColumnColor } from '../../types';
import { ColumnHeader } from './ColumnHeader';
import { ColumnMenu } from './ColumnMenu';
import { TaskCard } from '../Task/TaskCard';
import { useTaskActions } from '../../hooks/useTasks';
import { useColumnActions, useColumns } from '../../hooks/useColumns';
import { db } from '../../db';
import { getColumnWidth } from '../../utils/columnWidth';
import { cn } from '@/lib/utils';
import { ClipboardCheck, Plus } from 'lucide-react';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  boardType: Board['type'];
  isEditing?: boolean;
  onEditComplete?: () => void;
}

export function Column({ column, tasks, boardType, isEditing: externalIsEditing = false, onEditComplete }: ColumnProps) {
  const [newTaskId, setNewTaskId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(externalIsEditing);

  useEffect(() => {
    setIsEditing(externalIsEditing);
  }, [externalIsEditing]);

  const { createTask } = useTaskActions();
  const { updateColumn, deleteColumn } = useColumnActions();
  const columns = useColumns(column.boardId);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `${column.id}-dropzone`,
    data: {
      type: 'column',
      columnId: column.id,
      column,
    },
  });

  const columnWidth = getColumnWidth(boardType, column.title);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    width: `${columnWidth}px`,
  };

  const taskIds = tasks.map((task) => task.id);
  const hasMultipleColumns = (columns?.length ?? 0) > 1;
  const hasTasks = tasks.length > 0;

  const handleAddTask = useCallback(async () => {
    const taskId = await createTask(column.id, '');
    setNewTaskId(taskId);
  }, [column.id, createTask]);

  const handleNewTaskDeleted = useCallback(() => {
    setNewTaskId(null);
  }, []);

  const handleTitleChange = useCallback(
    async (newTitle: string) => {
      await updateColumn(column.id, { title: newTitle });
    },
    [column.id, updateColumn]
  );

  const handleEditComplete = useCallback(() => {
    setIsEditing(false);
    onEditComplete?.();
  }, [onEditComplete]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleColorChange = useCallback(
    async (color: ColumnColor) => {
      await updateColumn(column.id, { color });
    },
    [column.id, updateColumn]
  );

  const getPreviousColumnId = useCallback((): string | null => {
    if (!columns || columns.length <= 1) return null;
    const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
    const currentIndex = sortedColumns.findIndex((c) => c.id === column.id);
    if (currentIndex <= 0) {
      return sortedColumns[currentIndex + 1]?.id ?? null;
    }
    return sortedColumns[currentIndex - 1]?.id ?? null;
  }, [columns, column.id]);

  const handleDeleteColumn = useCallback(
    async (moveTasksTo?: string) => {
      if (moveTasksTo) {
        await db.transaction('rw', [db.columns, db.tasks], async () => {
          const targetTasks = await db.tasks.where('columnId').equals(moveTasksTo).toArray();
          const maxOrder = targetTasks.reduce((max, t) => Math.max(max, t.order), -1);
          const tasksToMove = await db.tasks.where('columnId').equals(column.id).toArray();
          for (let i = 0; i < tasksToMove.length; i++) {
            await db.tasks.update(tasksToMove[i].id, {
              columnId: moveTasksTo,
              order: maxOrder + 1 + i,
            });
          }
          await db.columns.delete(column.id);
        });
      } else {
        await deleteColumn(column.id);
      }
    },
    [column.id, deleteColumn]
  );

  return (
    <div
      data-column
      ref={setSortableRef}
      style={style}
      className={cn(
        'group flex-shrink-0 flex flex-col max-h-full',
        // Glassmorphism background
        'bg-surface-sunken/70 backdrop-blur-sm rounded-xl',
        'border border-white/30 dark:border-white/10',
        'transition-all duration-150',
        isOver && 'ring-2 ring-primary/30 border-primary/30 bg-accent/50',
        isDragging ? 'z-50 shadow-xl' : 'shadow-sm'
      )}
    >
      {/* Header */}
      <ColumnHeader
        columnId={column.id}
        title={column.title}
        taskCount={tasks.length}
        color={column.color}
        isEditing={isEditing}
        onTitleChange={handleTitleChange}
        onEditComplete={handleEditComplete}
        dragHandleProps={{ ...attributes, ...listeners }}
        menuSlot={
          <ColumnMenu
            columnId={column.id}
            currentColor={column.color}
            hasMultipleColumns={hasMultipleColumns}
            hasTasks={hasTasks}
            onEdit={handleStartEdit}
            onChangeColor={handleColorChange}
            onDelete={handleDeleteColumn}
            getPreviousColumnId={getPreviousColumnId}
          />
        }
      />

      {/* Tasks Area - Droppable zone for tasks */}
      <div
        ref={setDroppableRef}
        className="flex-1 px-3 pb-3 overflow-y-auto"
        style={{ minHeight: '150px' }}
      >
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isNew={task.id === newTaskId}
                  onTaskDeleted={task.id === newTaskId ? handleNewTaskDeleted : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8 px-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-3 animate-empty-pulse">
                <ClipboardCheck className="h-6 w-6 text-primary/50" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-foreground/60 mb-1">No tasks</p>
              <p className="text-xs text-muted-foreground text-center mb-3">Add your first task</p>
              <button
                onClick={handleAddTask}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 active:scale-95"
              >
                <Plus className="h-3 w-3" />
                Add task
              </button>
            </div>
          )}
        </SortableContext>
      </div>

      {/* Add Task Button */}
      <div className="px-2 pb-2">
        <button
          className={cn(
            'w-full py-2 px-3 rounded-lg',
            'text-sm font-medium text-muted-foreground',
            'flex items-center justify-center gap-1.5',
            'transition-all duration-150',
            'hover:text-foreground hover:bg-accent',
            'active:scale-[0.98]'
          )}
          onClick={handleAddTask}
        >
          <Plus className="h-4 w-4" />
          Add task
        </button>
      </div>
    </div>
  );
}
