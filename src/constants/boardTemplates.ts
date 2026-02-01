import type { BoardTemplate, ColumnColor } from '../types';

// Extended template with additional metadata
export interface ExtendedBoardTemplate extends BoardTemplate {
  id: string;
  description: string;
  color: ColumnColor;
  icon: 'kanban' | 'sprint' | 'project' | 'study' | 'custom';
}

export const BOARD_TEMPLATES: Record<string, BoardTemplate> = {
  kanban: {
    type: 'kanban',
    name: 'Kanban Board',
    columns: ['To Do', 'In Progress', 'Done'],
  },
  'study-planner': {
    type: 'study-planner',
    name: 'Study Planner',
    columns: [
      'Planejamento',
      'Seg',
      'Ter',
      'Qua',
      'Qui',
      'Sex',
      'Sab',
      'Dom',
      'Finalizado',
      'Favoritos',
    ],
  },
};

// Extended templates for the enhanced CreateBoardModal
export const EXTENDED_BOARD_TEMPLATES: ExtendedBoardTemplate[] = [
  {
    id: 'kanban',
    type: 'kanban',
    name: 'Kanban',
    description: 'Classic workflow board',
    columns: ['To Do', 'In Progress', 'Done'],
    color: 'blue',
    icon: 'kanban',
  },
  {
    id: 'sprint',
    type: 'kanban',
    name: 'Sprint',
    description: 'Agile sprint planning',
    columns: ['Backlog', 'Sprint', 'In Progress', 'Review', 'Done'],
    color: 'purple',
    icon: 'sprint',
  },
  {
    id: 'project',
    type: 'kanban',
    name: 'Project',
    description: 'Project milestone tracking',
    columns: ['Ideas', 'Planning', 'Active', 'Completed'],
    color: 'green',
    icon: 'project',
  },
  {
    id: 'study-planner',
    type: 'study-planner',
    name: 'Study Planner',
    description: 'Weekly study schedule',
    columns: ['Planejamento', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom', 'Finalizado'],
    color: 'amber',
    icon: 'study',
  },
  {
    id: 'custom',
    type: 'kanban',
    name: 'Custom',
    description: 'Start from scratch',
    columns: [],
    color: 'slate',
    icon: 'custom',
  },
];

export const getDefaultColumns = (type: 'kanban' | 'study-planner'): string[] => {
  return BOARD_TEMPLATES[type]?.columns || BOARD_TEMPLATES.kanban.columns;
};

export const getTemplateById = (id: string): ExtendedBoardTemplate | undefined => {
  return EXTENDED_BOARD_TEMPLATES.find(t => t.id === id);
};
