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
import { cn } from '@/lib/utils';

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

  const currentTasks = localTasks.length > 0 ? localTasks : (tasks ?? []);

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

  const findTask = useCallback(
    (taskId: string): Task | undefined => {
      return currentTasks.find((t) => t.id === taskId);
    },
    [currentTasks]
  );

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

      if (activeData?.type === 'column') {
        setActiveColumn(activeData.column as ColumnType);
        return;
      }

      const task = findTask(active.id as string);
      if (task) {
        setActiveTask(task);
        setLocalTasks([...(tasks ?? [])]);
      }
    },
    [findTask, tasks]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      if (active.data.current?.type === 'column') return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeColumnId = findColumnByTaskId(activeId);
      let overColumnId: string | undefined;

      if (over.data.current?.type === 'column') {
        overColumnId = overId;
      } else if (over.data.current?.type === 'task') {
        overColumnId = over.data.current.columnId;
      } else {
        overColumnId = columns?.find((c) => c.id === overId)?.id;
      }

      if (!activeColumnId || !overColumnId) return;

      if (activeColumnId !== overColumnId) {
        setLocalTasks((prev) => {
          const activeTask = prev.find((t) => t.id === activeId);
          if (!activeTask) return prev;

          const overTasks = prev
            .filter((t) => t.columnId === overColumnId)
            .sort((a, b) => a.order - b.order);

          let newIndex = overTasks.length;
          if (over.data.current?.type === 'task') {
            const overTaskIndex = overTasks.findIndex((t) => t.id === overId);
            if (overTaskIndex !== -1) {
              newIndex = overTaskIndex;
            }
          }

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

      const activeColumnId = active.data.current?.columnId;
      let overColumnId: string | undefined;
      let overIndex = 0;

      if (over.data.current?.type === 'column') {
        overColumnId = overId;
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

      if (activeColumnId === overColumnId && activeId !== overId) {
        const columnTasks = localTasks
          .filter((t) => t.columnId === overColumnId)
          .sort((a, b) => a.order - b.order);

        const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
        const newIndex = columnTasks.findIndex((t) => t.id === overId);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          try {
            await moveTask(activeId, overColumnId, newIndex);
          } catch (error) {
            console.error('Failed to move task:', error);
          }
        }
      } else if (activeColumnId !== overColumnId) {
        try {
          await moveTask(activeId, overColumnId, overIndex);
        } catch (error) {
          console.error('Failed to move task:', error);
        }
      }

      setLocalTasks([]);
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

  const sortedColumns = useMemo(() => {
    return columns ? [...columns].sort((a, b) => a.order - b.order) : [];
  }, [columns]);

  const columnIds = useMemo(() => {
    return sortedColumns.map((c) => c.id);
  }, [sortedColumns]);

  if (!activeBoardId || !board) {
    return (
      <div className="flex-1 flex items-center justify-center board-gradient">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-lg font-medium text-foreground mb-1">No board selected</p>
          <p className="text-sm text-muted-foreground">Choose a board from the sidebar to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden board-gradient">
      {/* Board Header */}
      <div className="px-6 py-4 border-b border-border/50 bg-background/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">{board.name}</h2>
            <p className="text-xs text-muted-foreground">
              {sortedColumns.length} {sortedColumns.length === 1 ? 'column' : 'columns'} · {tasks?.length || 0} {(tasks?.length || 0) === 1 ? 'task' : 'tasks'}
            </p>
          </div>
        </div>
      </div>

      {/* Columns Container */}
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
        <div
          className={cn(
            'flex-1 flex gap-4 overflow-x-auto p-6',
            'scroll-smooth'
          )}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
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
