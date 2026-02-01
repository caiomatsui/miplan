import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  pointerWithin,
  rectIntersection,
  MeasuringStrategy,
  CollisionDetection,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useColumns, useColumnActions } from '../../hooks/useColumns';
import { useBoard, useBoardActions } from '../../hooks/useBoard';
import { useTasks, useTaskActions } from '../../hooks/useTasks';
import { useUIStore } from '../../store';
import { usePanScroll } from '../../hooks/usePanScroll';
import { Task, Column as ColumnType } from '../../types';
import { Column } from './Column';
import { AddColumn } from './AddColumn';
import { TaskCardOverlay } from '../Task/TaskCard';
import { TaskDetailSheet } from '../Task/TaskDetailSheet';
import { ColumnOverlay } from './ColumnOverlay';
import { useDragSensors } from '../../hooks/useDragAndDrop';
import { cn } from '@/lib/utils';
import { ClipboardList, Columns3, Pencil } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

// Custom collision detection that prioritizes column dropzones over tasks
// This ensures tasks can be dropped into columns even when dragging over empty space
const customCollisionDetection: CollisionDetection = (args) => {
  // First, check for pointer intersections
  const pointerCollisions = pointerWithin(args);

  // Also check rectIntersection for cases where pointer might miss dropzone
  const rectCollisions = rectIntersection(args);

  // Combine all collisions and dedupe
  const allCollisions = [...pointerCollisions];
  for (const rc of rectCollisions) {
    if (!allCollisions.find(c => c.id === rc.id)) {
      allCollisions.push(rc);
    }
  }

  // Filter to find column dropzones (they have IDs ending with -dropzone)
  const columnDropzones = allCollisions.filter(
    (collision) => String(collision.id).endsWith('-dropzone')
  );

  // If we found dropzones, prioritize them
  if (columnDropzones.length > 0) {
    return columnDropzones;
  }

  // Otherwise, return pointer collisions (for task sorting within same column)
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  return rectCollisions;
};

export function Board() {
  const activeBoardId = useUIStore((state) => state.activeBoardId);
  const selectedTaskId = useUIStore((state) => state.selectedTaskId);
  const setSelectedTask = useUIStore((state) => state.setSelectedTask);
  const board = useBoard(activeBoardId);
  const columns = useColumns(activeBoardId);
  const tasks = useTasks(activeBoardId);
  const { moveTask } = useTaskActions();
  const { reorderColumns } = useColumnActions();
  const { updateBoard } = useBoardActions();
  const sensors = useDragSensors();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [newColumnId, setNewColumnId] = useState<string | null>(null);

  // Board name editing state
  const [isEditingBoardName, setIsEditingBoardName] = useState(false);
  const [editBoardName, setEditBoardName] = useState('');
  const boardNameInputRef = useRef<HTMLInputElement>(null);

  // Pan-to-scroll functionality
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const { isPanning } = usePanScroll(boardContainerRef, {
    enabled: !activeTask && !activeColumn, // Disable during DnD
  });

  // Focus board name input when editing starts
  useEffect(() => {
    if (isEditingBoardName && boardNameInputRef.current) {
      boardNameInputRef.current.focus();
      boardNameInputRef.current.select();
    }
  }, [isEditingBoardName]);

  // Board name editing handlers
  const handleStartEditBoardName = useCallback(() => {
    if (board) {
      setEditBoardName(board.name);
      setIsEditingBoardName(true);
    }
  }, [board]);

  const handleSaveBoardName = useCallback(async () => {
    const trimmed = editBoardName.trim();
    if (trimmed && board && trimmed !== board.name) {
      await updateBoard(board.id, { name: trimmed });
    }
    setIsEditingBoardName(false);
  }, [editBoardName, board, updateBoard]);

  const handleCancelEditBoardName = useCallback(() => {
    setIsEditingBoardName(false);
    if (board) {
      setEditBoardName(board.name);
    }
  }, [board]);

  const handleBoardNameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveBoardName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditBoardName();
    }
  }, [handleSaveBoardName, handleCancelEditBoardName]);

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

      // Ignore column dragging
      if (active.data.current?.type === 'column') return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Get the current column of the active task from localTasks (which may have been updated)
      const activeTask = localTasks.find((t) => t.id === activeId) || currentTasks.find((t) => t.id === activeId);
      const activeColumnId = activeTask?.columnId;
      let overColumnId: string | undefined;

      // Determine target column
      if (over.data.current?.type === 'column') {
        overColumnId = over.data.current?.columnId;
        if (!overColumnId && overId.endsWith('-dropzone')) {
          overColumnId = overId.replace('-dropzone', '');
        }
      } else if (over.data.current?.type === 'task') {
        overColumnId = over.data.current.columnId;
      } else if (overId.endsWith('-dropzone')) {
        overColumnId = overId.replace('-dropzone', '');
      }

      if (!activeColumnId || !overColumnId) return;

      // Only update if moving to a different column
      if (activeColumnId !== overColumnId) {
        setLocalTasks((prev) => {
          const task = prev.find((t) => t.id === activeId);
          if (!task) return prev;

          const overTasks = prev
            .filter((t) => t.columnId === overColumnId && t.id !== activeId)
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
    [localTasks, currentTasks]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      // Capture original column from activeTask state BEFORE clearing it
      // activeTask was set in handleDragStart and contains the task's original data
      const originalColumnId = activeTask?.columnId;

      // Clear drag state
      setActiveTask(null);
      setActiveColumn(null);

      if (!over) {
        setLocalTasks([]);
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      // Handle column reordering
      if (active.data.current?.type === 'column') {
        // Get the target column ID - could be from sortable or dropzone
        let targetColumnId = overId;

        // If over is a dropzone, extract the column ID
        if (overId.endsWith('-dropzone')) {
          targetColumnId = overId.replace('-dropzone', '');
        }
        // If over has column data, use that
        if (over.data.current?.column?.id) {
          targetColumnId = over.data.current.column.id;
        }

        if (activeId !== targetColumnId && columns && activeBoardId) {
          const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
          const oldIndex = sortedColumns.findIndex((c) => c.id === activeId);
          const newIndex = sortedColumns.findIndex((c) => c.id === targetColumnId);

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
        setLocalTasks([]);
        return;
      }

      // For task moves, use the original column captured from activeTask state
      // This is more reliable than active.data.current which might not update properly
      const activeColumnId = originalColumnId || active.data.current?.columnId;
      let overColumnId: string | undefined;
      let overIndex = 0;

      // Determine target column and index based on what we're dropping over
      if (over.data.current?.type === 'column') {
        // Dropping on a column dropzone
        overColumnId = over.data.current?.columnId;
        // Fallback: extract from overId if it ends with -dropzone
        if (!overColumnId && overId.endsWith('-dropzone')) {
          overColumnId = overId.replace('-dropzone', '');
        }
        const columnTasks = localTasks
          .filter((t) => t.columnId === overColumnId && t.id !== activeId)
          .sort((a, b) => a.order - b.order);
        overIndex = columnTasks.length;
      } else if (over.data.current?.type === 'task') {
        // Dropping on another task - use that task's column
        overColumnId = over.data.current.columnId;
        const columnTasks = localTasks
          .filter((t) => t.columnId === overColumnId)
          .sort((a, b) => a.order - b.order);
        const overTaskIndex = columnTasks.findIndex((t) => t.id === overId);
        overIndex = overTaskIndex !== -1 ? overTaskIndex : columnTasks.length;
      } else if (overId.endsWith('-dropzone')) {
        // Fallback: over has no type but ID looks like a dropzone
        overColumnId = overId.replace('-dropzone', '');
        const columnTasks = localTasks
          .filter((t) => t.columnId === overColumnId && t.id !== activeId)
          .sort((a, b) => a.order - b.order);
        overIndex = columnTasks.length;
      }

      if (!overColumnId || !activeColumnId) {
        setLocalTasks([]);
        return;
      }

      if (activeColumnId === overColumnId && activeId !== overId) {
        // Same column reorder
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
        // Cross-column move
        try {
          await moveTask(activeId, overColumnId, overIndex);
        } catch (error) {
          console.error('Failed to move task:', error);
        }
      }

      setLocalTasks([]);
    },
    [activeTask, localTasks, moveTask, columns, activeBoardId, reorderColumns]
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
            <ClipboardList className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
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
            <Columns3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 group/boardname">
              {isEditingBoardName ? (
                <input
                  ref={boardNameInputRef}
                  type="text"
                  value={editBoardName}
                  onChange={(e) => setEditBoardName(e.target.value)}
                  onBlur={handleSaveBoardName}
                  onKeyDown={handleBoardNameKeyDown}
                  className={cn(
                    'text-lg font-semibold text-foreground tracking-tight',
                    'bg-card border border-primary/30 rounded-lg',
                    'px-2 py-0.5 -ml-2',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30',
                    'min-w-[200px]'
                  )}
                  aria-label="Board name"
                />
              ) : (
                <>
                  <h2
                    onClick={handleStartEditBoardName}
                    className="text-lg font-semibold text-foreground tracking-tight cursor-pointer hover:text-primary transition-colors"
                    title="Click to edit board name"
                  >
                    {board.name}
                  </h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleStartEditBoardName}
                        className="p-1 rounded opacity-0 group-hover/boardname:opacity-100 text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                        aria-label="Edit board name"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Edit board name</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {sortedColumns.length} {sortedColumns.length === 1 ? 'column' : 'columns'} · {tasks?.length || 0} {(tasks?.length || 0) === 1 ? 'task' : 'tasks'}
            </p>
          </div>
        </div>
      </div>

      {/* Columns Container */}
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
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
          ref={boardContainerRef}
          className={cn(
            'flex-1 flex gap-4 overflow-x-auto p-6',
            'scroll-smooth select-none',
            isPanning ? 'cursor-grabbing' : 'cursor-default'
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
