export type TaskPriority = 'high' | 'medium' | 'low' | 'none';

export interface Task {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  order: number;
  priority: TaskPriority;
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

export interface Label {
  id: string;
  boardId: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface TaskLabel {
  id: string;
  taskId: string;
  labelId: string;
}
