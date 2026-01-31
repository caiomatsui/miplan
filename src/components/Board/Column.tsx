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

  // Sync with external editing state
  useEffect(() => {
    setIsEditing(externalIsEditing);
  }, [externalIsEditing]);
  const { createTask } = useTaskActions();
  const { updateColumn, deleteColumn } = useColumnActions();
  const columns = useColumns(column.boardId);

  // Sortable for column drag-and-drop
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

  // Droppable for receiving tasks
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
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
    // Create task with empty title (will be in edit mode)
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
      // If first column, return the next one
      return sortedColumns[currentIndex + 1]?.id ?? null;
    }
    return sortedColumns[currentIndex - 1]?.id ?? null;
  }, [columns, column.id]);

  const handleDeleteColumn = useCallback(
    async (moveTasksTo?: string) => {
      if (moveTasksTo) {
        // Move tasks to target column before deleting
        await db.transaction('rw', [db.columns, db.tasks], async () => {
          // Get current max order in target column
          const targetTasks = await db.tasks.where('columnId').equals(moveTasksTo).toArray();
          const maxOrder = targetTasks.reduce((max, t) => Math.max(max, t.order), -1);

          // Move tasks with new orders
          const tasksToMove = await db.tasks.where('columnId').equals(column.id).toArray();
          for (let i = 0; i < tasksToMove.length; i++) {
            await db.tasks.update(tasksToMove[i].id, {
              columnId: moveTasksTo,
              order: maxOrder + 1 + i,
            });
          }

          // Delete the column
          await db.columns.delete(column.id);
        });
      } else {
        // Delete column with all its tasks
        await deleteColumn(column.id);
      }
    },
    [column.id, deleteColumn]
  );

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`
        flex-shrink-0 bg-gray-100 rounded-lg flex flex-col max-h-full
        transition-colors duration-150
        ${isOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''}
        ${isDragging ? 'z-50' : ''}
      `}
    >
      {/* Header - draggable by header */}
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

      {/* Tasks Area - Droppable */}
      <div
        ref={setDroppableRef}
        className="flex-1 px-2 pb-2 overflow-y-auto min-h-[100px]"
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
            <div className="h-full flex items-center justify-center text-gray-400 text-sm py-8">
              No tasks
            </div>
          )}
        </SortableContext>
      </div>

      {/* Add Task Button */}
      <div className="p-2 border-t border-gray-200">
        <button
          className="w-full py-2 px-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors duration-150 flex items-center justify-center"
          onClick={handleAddTask}
        >
          <span className="mr-1">+</span>
          Add task
        </button>
      </div>
    </div>
  );
}
