import { useState, useCallback, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Column as ColumnType, Task, Board } from '../../types';
import { ColumnHeader } from './ColumnHeader';
import { ColumnMenu } from './ColumnMenu';
import { TaskCard } from '../Task/TaskCard';
import { useTaskActions } from '../../hooks/useTasks';
import { useColumnActions, useColumns } from '../../hooks/useColumns';
import { db } from '../../db';
import { getColumnWidth } from '../../utils/columnWidth';
import { cn } from '@/lib/utils';

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
      ref={setSortableRef}
      style={style}
      className={cn(
        'flex-shrink-0 flex flex-col max-h-full',
        'bg-surface-sunken rounded-xl',
        'border border-border/40',
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
        isEditing={isEditing}
        onTitleChange={handleTitleChange}
        onEditComplete={handleEditComplete}
        dragHandleProps={{ ...attributes, ...listeners }}
        menuSlot={
          <ColumnMenu
            columnId={column.id}
            hasMultipleColumns={hasMultipleColumns}
            hasTasks={hasTasks}
            onDelete={handleDeleteColumn}
            getPreviousColumnId={getPreviousColumnId}
          />
        }
      />

      {/* Tasks Area */}
      <div
        ref={setDroppableRef}
        className="flex-1 px-3 pb-3 overflow-y-auto min-h-[100px]"
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
                <svg className="w-6 h-6 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground/60 mb-1">No tasks</p>
              <p className="text-xs text-muted-foreground text-center mb-3">Add your first task</p>
              <button
                onClick={handleAddTask}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 active:scale-95"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add task
        </button>
      </div>
    </div>
  );
}
