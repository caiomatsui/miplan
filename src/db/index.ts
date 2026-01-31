import Dexie, { Table } from 'dexie';
import { Board, Column, Task } from '../types';

export class MiplanDB extends Dexie {
  boards!: Table<Board>;
  columns!: Table<Column>;
  tasks!: Table<Task>;

  constructor() {
    super('miplan');
    this.version(1).stores({
      boards: 'id, type, createdAt',
      columns: 'id, boardId, order',
      tasks: 'id, boardId, columnId, order, createdAt'
    });
  }
}

export const db = new MiplanDB();
