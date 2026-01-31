import type { Board } from '../types';

/**
 * Get the column width based on board type and column title.
 *
 * Study Planner columns have variable widths:
 * - Planejamento, Finalizado: 220px (larger for planning/done tasks)
 * - Dias da semana (Seg-Dom): 160px (compact for daily tasks)
 * - Favoritos: 120px (narrow for favorites)
 *
 * Kanban columns use default 280px width.
 */
export const getColumnWidth = (boardType: Board['type'], columnTitle: string): number => {
  if (boardType === 'study-planner') {
    if (['Planejamento', 'Finalizado'].includes(columnTitle)) {
      return 220;
    }
    if (columnTitle === 'Favoritos') {
      return 120;
    }
    // Days of the week (Seg, Ter, Qua, Qui, Sex, Sab, Dom)
    return 160;
  }
  // Kanban default
  return 280;
};
