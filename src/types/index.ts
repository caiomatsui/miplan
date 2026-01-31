export interface Task {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  order: number;
  timeSpent: number;
  timerStartedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  order: number;
}

export interface Board {
  id: string;
  name: string;
  type: 'kanban' | 'study-planner';
  createdAt: number;
  updatedAt: number;
}

export type BoardTemplate = {
  type: Board['type'];
  name: string;
  columns: string[];
};
