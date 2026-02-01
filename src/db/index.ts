import Dexie, { Table } from 'dexie';
import { Board, Column, Task, Label, TaskLabel } from '../types';

export class MiplanDB extends Dexie {
  boards!: Table<Board>;
  columns!: Table<Column>;
  tasks!: Table<Task>;
  labels!: Table<Label>;
  taskLabels!: Table<TaskLabel>;

  constructor() {
    super('miplan');

    // Version 1: Initial schema
    this.version(1).stores({
      boards: 'id, type, createdAt',
      columns: 'id, boardId, order',
      tasks: 'id, boardId, columnId, order, createdAt'
    });

    // Version 2: Add priority to tasks
    this.version(2).stores({
      boards: 'id, type, createdAt',
      columns: 'id, boardId, order',
      tasks: 'id, boardId, columnId, order, priority, createdAt'
    }).upgrade(tx => {
      return tx.table('tasks').toCollection().modify(task => {
        if (!task.priority) {
          task.priority = 'none';
        }
      });
    });

    // Version 3: Add labels and taskLabels tables
    this.version(3).stores({
      boards: 'id, type, createdAt',
      columns: 'id, boardId, order',
      tasks: 'id, boardId, columnId, order, priority, createdAt',
      labels: 'id, boardId, createdAt',
      taskLabels: 'id, taskId, labelId, [taskId+labelId]'
    });

    // Version 4: Add color field to columns and boards
    this.version(4).stores({
      boards: 'id, type, createdAt',
      columns: 'id, boardId, order',
      tasks: 'id, boardId, columnId, order, priority, createdAt',
      labels: 'id, boardId, createdAt',
      taskLabels: 'id, taskId, labelId, [taskId+labelId]'
    }).upgrade(tx => {
      // Add default color to existing columns
      return tx.table('columns').toCollection().modify(column => {
        if (!column.color) {
          column.color = 'slate';
        }
      });
    });
  }
}

export const db = new MiplanDB();
