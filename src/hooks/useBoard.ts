import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Board } from '../types';

export function useBoards() {
  const boards = useLiveQuery(() => db.boards.toArray());
  return boards;
}

export function useBoard(boardId: string | null) {
  const board = useLiveQuery(
    () => (boardId ? db.boards.get(boardId) : undefined),
    [boardId]
  );
  return board;
}

export function useBoardActions() {
  const createBoard = async (
    name: string,
    type: Board['type']
  ): Promise<string> => {
    const now = Date.now();
    const id = crypto.randomUUID();
    await db.boards.add({
      id,
      name,
      type,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  };

  const updateBoard = async (
    id: string,
    data: Partial<Omit<Board, 'id' | 'createdAt'>>
  ): Promise<void> => {
    await db.boards.update(id, {
      ...data,
      updatedAt: Date.now(),
    });
  };

  const deleteBoard = async (id: string): Promise<void> => {
    await db.transaction('rw', [db.boards, db.columns, db.tasks], async () => {
      // Delete all tasks in this board
      await db.tasks.where('boardId').equals(id).delete();
      // Delete all columns in this board
      await db.columns.where('boardId').equals(id).delete();
      // Delete the board
      await db.boards.delete(id);
    });
  };

  return {
    createBoard,
    updateBoard,
    deleteBoard,
  };
}
