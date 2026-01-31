import type { BoardTemplate } from '../types';

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

export const getDefaultColumns = (type: 'kanban' | 'study-planner'): string[] => {
  return BOARD_TEMPLATES[type]?.columns || BOARD_TEMPLATES.kanban.columns;
};
