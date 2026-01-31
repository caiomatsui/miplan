import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Task } from '../types';

export function useTasks(boardId: string | null) {
  const tasks = useLiveQuery(
    () =>
      boardId ? db.tasks.where('boardId').equals(boardId).sortBy('order') : [],
    [boardId]
  );
  return tasks;
}

export function useTasksByColumn(columnId: string | null) {
  const tasks = useLiveQuery(
    () =>
      columnId
        ? db.tasks.where('columnId').equals(columnId).sortBy('order')
        : [],
    [columnId]
  );
  return tasks;
}

export function useTask(taskId: string | null) {
  const task = useLiveQuery(
    () => (taskId ? db.tasks.get(taskId) : undefined),
    [taskId]
  );
  return task;
}

export function useTaskActions() {
  const createTask = async (
    columnId: string,
    title: string
  ): Promise<string> => {
    const id = crypto.randomUUID();
    const now = Date.now();

    // Get the column to find the boardId
    const column = await db.columns.get(columnId);
    if (!column) {
      throw new Error(`Column ${columnId} not found`);
    }

    // Get the highest order in this column
    const existingTasks = await db.tasks
      .where('columnId')
      .equals(columnId)
      .toArray();
    const maxOrder = existingTasks.reduce(
      (max, task) => Math.max(max, task.order),
      -1
    );

    await db.tasks.add({
      id,
      boardId: column.boardId,
      columnId,
      title,
      description: '',
      order: maxOrder + 1,
      priority: 'none',
      timeSpent: 0,
      timerStartedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  };

  const updateTask = async (
    id: string,
    data: Partial<Omit<Task, 'id' | 'boardId' | 'createdAt'>>
  ): Promise<void> => {
    await db.tasks.update(id, {
      ...data,
      updatedAt: Date.now(),
    });
  };

  const deleteTask = async (id: string): Promise<void> => {
    await db.tasks.delete(id);
  };

  const moveTask = async (
    taskId: string,
    newColumnId: string,
    newOrder: number
  ): Promise<void> => {
    const task = await db.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const newColumn = await db.columns.get(newColumnId);
    if (!newColumn) {
      throw new Error(`Column ${newColumnId} not found`);
    }

    await db.transaction('rw', db.tasks, async () => {
      // Get all tasks in the target column
      const tasksInColumn = await db.tasks
        .where('columnId')
        .equals(newColumnId)
        .sortBy('order');

      // If moving within the same column
      if (task.columnId === newColumnId) {
        const oldOrder = task.order;
        if (newOrder > oldOrder) {
          // Moving down: shift tasks between old and new position up
          for (const t of tasksInColumn) {
            if (t.order > oldOrder && t.order <= newOrder && t.id !== taskId) {
              await db.tasks.update(t.id, { order: t.order - 1 });
            }
          }
        } else if (newOrder < oldOrder) {
          // Moving up: shift tasks between new and old position down
          for (const t of tasksInColumn) {
            if (t.order >= newOrder && t.order < oldOrder && t.id !== taskId) {
              await db.tasks.update(t.id, { order: t.order + 1 });
            }
          }
        }
      } else {
        // Moving to a different column
        // Shift tasks at and after the new position down in the target column
        for (const t of tasksInColumn) {
          if (t.order >= newOrder) {
            await db.tasks.update(t.id, { order: t.order + 1 });
          }
        }

        // Shift tasks after the old position up in the source column
        const tasksInSourceColumn = await db.tasks
          .where('columnId')
          .equals(task.columnId)
          .sortBy('order');
        for (const t of tasksInSourceColumn) {
          if (t.order > task.order) {
            await db.tasks.update(t.id, { order: t.order - 1 });
          }
        }
      }

      // Update the task with new column and order
      await db.tasks.update(taskId, {
        columnId: newColumnId,
        boardId: newColumn.boardId,
        order: newOrder,
        updatedAt: Date.now(),
      });
    });
  };

  return {
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  };
}
