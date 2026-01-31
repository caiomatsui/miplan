import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useColumns, useColumnActions } from '../../hooks/useColumns';
import { useBoard } from '../../hooks/useBoard';
import { useTasks, useTaskActions } from '../../hooks/useTasks';
import { useUIStore } from '../../store';
import { Task, Column as ColumnType } from '../../types';
import { Column } from './Column';
import { AddColumn } from './AddColumn';
import { TaskCardOverlay } from '../Task/TaskCard';
import { TaskDetailSheet } from '../Task/TaskDetailSheet';
import { ColumnOverlay } from './ColumnOverlay';
import { useDragSensors } from '../../hooks/useDragAndDrop';

export function Board() {
  const activeBoardId = useUIStore((state) => state.activeBoardId);
  const selectedTaskId = useUIStore((state) => state.selectedTaskId);
  const setSelectedTask = useUIStore((state) => state.setSelectedTask);
  const board = useBoard(activeBoardId);
  const columns = useColumns(activeBoardId);
  const tasks = useTasks(activeBoardId);
  const { moveTask } = useTaskActions();
  const { reorderColumns } = useColumnActions();
  const sensors = useDragSensors();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [newColumnId, setNewColumnId] = useState<string | null>(null);

  // Use local tasks during drag for optimistic UI, otherwise use DB tasks
  const currentTasks = localTasks.length > 0 ? localTasks : (tasks ?? []);

  // Group tasks by column, sorted by order
  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    if (columns) {
      for (const column of columns) {
        grouped[column.id] = currentTasks
          .filter((task) => task.columnId === column.id)
          .sort((a, b) => a.order - b.order);
      }
    }
    return grouped;
  }, [columns, currentTasks]);

  // Find task by ID
  const findTask = useCallback(
    (taskId: string): Task | undefined => {
      return currentTasks.find((t) => t.id === taskId);
    },
    [currentTasks]
  );

  // Find column containing a task
  const findColumnByTaskId = useCallback(
    (taskId: string): string | undefined => {
      const task = findTask(taskId);
      return task?.columnId;
    },
    [findTask]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeData = active.data.current;

      // Check if dragging a column
      if (activeData?.type === 'column') {
        setActiveColumn(activeData.column as ColumnType);
        return;
      }

      // Otherwise, dragging a task
      const task = findTask(active.id as string);
      if (task) {
        setActiveTask(task);
        setLocalTasks([...(tasks ?? [])]); // Start tracking local state
      }
    },
    [findTask, tasks]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      // Skip if dragging a column (columns don't need dragOver handling)
      if (active.data.current?.type === 'column') return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Determine the source and target columns
      const activeColumnId = findColumnByTaskId(activeId);
      let overColumnId: string | undefined;

      // Check if over is a column or a task
      if (over.data.current?.type === 'column') {
        overColumnId = overId;
      } else if (over.data.current?.type === 'task') {
        overColumnId = over.data.current.columnId;
      } else {
        // Might be dropping on the column itself
        overColumnId = columns?.find((c) => c.id === overId)?.id;
      }

      if (!activeColumnId || !overColumnId) return;

      // If moving to a different column, update local state for optimistic UI
      if (activeColumnId !== overColumnId) {
        setLocalTasks((prev) => {
          const activeTask = prev.find((t) => t.id === activeId);
          if (!activeTask) return prev;

          const overTasks = prev
            .filter((t) => t.columnId === overColumnId)
            .sort((a, b) => a.order - b.order);

          // Find the index to insert at
          let newIndex = overTasks.length;
          if (over.data.current?.type === 'task') {
            const overTaskIndex = overTasks.findIndex((t) => t.id === overId);
            if (overTaskIndex !== -1) {
              newIndex = overTaskIndex;
            }
          }

          // Update the task's columnId optimistically
          return prev.map((t) => {
            if (t.id === activeId) {
              return { ...t, columnId: overColumnId!, order: newIndex };
            }
            return t;
          });
        });
      }
    },
    [findColumnByTaskId, columns]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);
      setActiveColumn(null);

      if (!over) {
        setLocalTasks([]);
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      // Handle column reordering
      if (active.data.current?.type === 'column' && over.data.current?.type === 'column') {
        if (activeId !== overId && columns && activeBoardId) {
          const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
          const oldIndex = sortedColumns.findIndex((c) => c.id === activeId);
          const newIndex = sortedColumns.findIndex((c) => c.id === overId);

          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const reordered = arrayMove(sortedColumns, oldIndex, newIndex);
            const newColumnIds = reordered.map((c) => c.id);
            try {
              await reorderColumns(activeBoardId, newColumnIds);
            } catch (error) {
              console.error('Failed to reorder columns:', error);
            }
          }
        }
        return;
      }

      // Handle task movement
      const activeColumnId = active.data.current?.columnId;
      let overColumnId: string | undefined;
      let overIndex = 0;

      // Determine target column and position
      if (over.data.current?.type === 'column') {
        overColumnId = overId;
        // Dropping on column means end of list
        const columnTasks = localTasks
          .filter((t) => t.columnId === overId && t.id !== activeId)
          .sort((a, b) => a.order - b.order);
        overIndex = columnTasks.length;
      } else if (over.data.current?.type === 'task') {
        overColumnId = over.data.current.columnId;
        const columnTasks = localTasks
          .filter((t) => t.columnId === overColumnId)
          .sort((a, b) => a.order - b.order);
        const overTaskIndex = columnTasks.findIndex((t) => t.id === overId);
        overIndex = overTaskIndex !== -1 ? overTaskIndex : columnTasks.length;
      }

      if (!overColumnId) {
        setLocalTasks([]);
        return;
      }

      // Handle reordering within the same column
      if (activeColumnId === overColumnId && activeId !== overId) {
        const columnTasks = localTasks
          .filter((t) => t.columnId === overColumnId)
          .sort((a, b) => a.order - b.order);

        const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
        const newIndex = columnTasks.findIndex((t) => t.id === overId);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          // Reorder tasks - arrayMove is used internally by moveTask
          // Persist to database
          try {
            await moveTask(activeId, overColumnId, newIndex);
          } catch (error) {
            console.error('Failed to move task:', error);
          }
        }
      } else if (activeColumnId !== overColumnId) {
        // Moving to different column - persist to database
        try {
          await moveTask(activeId, overColumnId, overIndex);
        } catch (error) {
          console.error('Failed to move task:', error);
        }
      }

      setLocalTasks([]); // Clear local state, let useLiveQuery take over
    },
    [localTasks, moveTask, columns, activeBoardId, reorderColumns]
  );

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    setActiveColumn(null);
    setLocalTasks([]);
  }, []);

  const handleColumnCreated = useCallback((columnId: string) => {
    setNewColumnId(columnId);
  }, []);

  const handleColumnEditComplete = useCallback(() => {
    setNewColumnId(null);
  }, []);

  // Sorted columns for rendering
  const sortedColumns = useMemo(() => {
    return columns ? [...columns].sort((a, b) => a.order - b.order) : [];
  }, [columns]);

  const columnIds = useMemo(() => {
    return sortedColumns.map((c) => c.id);
  }, [sortedColumns]);

  if (!activeBoardId || !board) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Select a board to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Board Header */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <h2 className="text-xl font-semibold text-foreground">{board.name}</h2>
      </div>

      {/* Columns Container with DndContext */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
      >
        <div className="flex-1 flex gap-4 overflow-x-auto p-4" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
          <SortableContext
            items={columnIds}
            strategy={horizontalListSortingStrategy}
          >
            {sortedColumns.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={tasksByColumn[column.id] || []}
                boardType={board.type}
                isEditing={column.id === newColumnId}
                onEditComplete={handleColumnEditComplete}
              />
            ))}
          </SortableContext>
          <AddColumn onColumnCreated={handleColumnCreated} />
        </div>

        {/* Drag Overlay for visual feedback */}
        <DragOverlay dropAnimation={null}>
          {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
          {activeColumn ? (
            <ColumnOverlay column={activeColumn} taskCount={tasksByColumn[activeColumn.id]?.length ?? 0} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        task={selectedTaskId ? tasks?.find((t) => t.id === selectedTaskId) ?? null : null}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
