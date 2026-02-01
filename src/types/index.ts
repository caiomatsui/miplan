export type TaskPriority = 'high' | 'medium' | 'low' | 'none';

// Column accent color options
export type ColumnColor = 'slate' | 'red' | 'orange' | 'amber' | 'green' | 'teal' | 'blue' | 'purple';

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
  color?: ColumnColor;
}

export interface Board {
  id: string;
  name: string;
  type: 'kanban' | 'study-planner';
  color?: ColumnColor;
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
