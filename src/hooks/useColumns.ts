import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Column, ColumnColor } from '../types';
import { DEFAULT_COLUMN_COLOR } from '../constants/columnColors';

export function useColumns(boardId: string | null) {
  const columns = useLiveQuery(
    () =>
      boardId
        ? db.columns.where('boardId').equals(boardId).sortBy('order')
        : [],
    [boardId]
  );
  return columns;
}

export function useColumn(columnId: string | null) {
  const column = useLiveQuery(
    () => (columnId ? db.columns.get(columnId) : undefined),
    [columnId]
  );
  return column;
}

export function useColumnActions() {
  const createColumn = async (
    boardId: string,
    title: string,
    color: ColumnColor = DEFAULT_COLUMN_COLOR
  ): Promise<string> => {
    const id = crypto.randomUUID();

    // Get the highest order in this board
    const existingColumns = await db.columns
      .where('boardId')
      .equals(boardId)
      .toArray();
    const maxOrder = existingColumns.reduce(
      (max, col) => Math.max(max, col.order),
      -1
    );

    await db.columns.add({
      id,
      boardId,
      title,
      order: maxOrder + 1,
      color,
    });
    return id;
  };

  const updateColumn = async (
    id: string,
    data: Partial<Omit<Column, 'id' | 'boardId'>>
  ): Promise<void> => {
    await db.columns.update(id, data);
  };

  const deleteColumn = async (id: string): Promise<void> => {
    await db.transaction('rw', [db.columns, db.tasks], async () => {
      // Delete all tasks in this column
      await db.tasks.where('columnId').equals(id).delete();
      // Delete the column
      await db.columns.delete(id);
    });
  };

  const reorderColumns = async (
    _boardId: string,
    columnIds: string[]
  ): Promise<void> => {
    await db.transaction('rw', db.columns, async () => {
      const updates = columnIds.map((id, index) =>
        db.columns.update(id, { order: index })
      );
      await Promise.all(updates);
    });
  };

  return {
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
  };
}
