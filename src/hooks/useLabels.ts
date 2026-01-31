import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Label } from '../types';

/**
 * Get all labels for a specific board
 */
export function useLabels(boardId: string | null) {
  return useLiveQuery(
    () => (boardId ? db.labels.where('boardId').equals(boardId).toArray() : []),
    [boardId]
  );
}

/**
 * Get a single label by ID
 */
export function useLabel(labelId: string | null) {
  return useLiveQuery(
    () => (labelId ? db.labels.get(labelId) : undefined),
    [labelId]
  );
}

/**
 * Get all labels assigned to a specific task
 */
export function useTaskLabels(taskId: string | null) {
  return useLiveQuery(
    async () => {
      if (!taskId) return [];

      const taskLabels = await db.taskLabels.where('taskId').equals(taskId).toArray();
      const labelIds = taskLabels.map((tl) => tl.labelId);

      if (labelIds.length === 0) return [];

      return db.labels.where('id').anyOf(labelIds).toArray();
    },
    [taskId]
  );
}

/**
 * Hook providing actions for managing labels
 */
export function useLabelActions() {
  const createLabel = async (
    boardId: string,
    name: string,
    color: string
  ): Promise<string> => {
    const id = crypto.randomUUID();
    const now = Date.now();

    await db.labels.add({
      id,
      boardId,
      name,
      color,
      createdAt: now,
    });

    return id;
  };

  const updateLabel = async (
    labelId: string,
    data: Partial<Pick<Label, 'name' | 'color'>>
  ): Promise<void> => {
    await db.labels.update(labelId, data);
  };

  const deleteLabel = async (labelId: string): Promise<void> => {
    await db.transaction('rw', [db.labels, db.taskLabels], async () => {
      // Remove all task-label associations first
      await db.taskLabels.where('labelId').equals(labelId).delete();
      // Then delete the label
      await db.labels.delete(labelId);
    });
  };

  const addLabelToTask = async (taskId: string, labelId: string): Promise<void> => {
    // Check if association already exists
    const existing = await db.taskLabels
      .where({ taskId, labelId })
      .first();

    if (!existing) {
      await db.taskLabels.add({
        id: crypto.randomUUID(),
        taskId,
        labelId,
      });
    }
  };

  const removeLabelFromTask = async (taskId: string, labelId: string): Promise<void> => {
    await db.taskLabels.where({ taskId, labelId }).delete();
  };

  const toggleLabelOnTask = async (taskId: string, labelId: string): Promise<void> => {
    const existing = await db.taskLabels
      .where({ taskId, labelId })
      .first();

    if (existing) {
      await removeLabelFromTask(taskId, labelId);
    } else {
      await addLabelToTask(taskId, labelId);
    }
  };

  return {
    createLabel,
    updateLabel,
    deleteLabel,
    addLabelToTask,
    removeLabelFromTask,
    toggleLabelOnTask,
  };
}
