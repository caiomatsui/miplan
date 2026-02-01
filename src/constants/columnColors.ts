import type { ColumnColor } from '../types';

export interface ColorDefinition {
  key: ColumnColor;
  name: string;
  light: string;  // Hex for light mode preview
  dark: string;   // Hex for dark mode preview
}

export const COLUMN_COLORS: ColorDefinition[] = [
  { key: 'slate', name: 'Slate', light: '#64748B', dark: '#94A3B8' },
  { key: 'red', name: 'Red', light: '#EF4444', dark: '#F87171' },
  { key: 'orange', name: 'Orange', light: '#F97316', dark: '#FB923C' },
  { key: 'amber', name: 'Amber', light: '#F59E0B', dark: '#FBBF24' },
  { key: 'green', name: 'Green', light: '#22C55E', dark: '#4ADE80' },
  { key: 'teal', name: 'Teal', light: '#14B8A6', dark: '#2DD4BF' },
  { key: 'blue', name: 'Blue', light: '#3B82F6', dark: '#60A5FA' },
  { key: 'purple', name: 'Purple', light: '#A855F7', dark: '#C084FC' },
];

export const DEFAULT_COLUMN_COLOR: ColumnColor = 'slate';

/**
 * Get the CSS variable reference for a column accent color
 */
export const getColumnAccentVar = (colorKey: ColumnColor = 'slate'): string => {
  return `var(--accent-${colorKey})`;
};

/**
 * Get inline styles for column header based on accent color
 */
export const getColumnHeaderStyles = (colorKey: ColumnColor = 'slate') => ({
  borderLeftWidth: '3px',
  borderLeftColor: `oklch(var(--accent-${colorKey}))`,
  background: `linear-gradient(90deg, oklch(var(--accent-${colorKey}) / 0.08) 0%, transparent 50%)`,
});

/**
 * Get Tailwind class for accent color backgrounds with opacity
 */
export const getAccentBgClass = (colorKey: ColumnColor = 'slate', opacity: number = 0.1): string => {
  const opacityMap: Record<number, string> = {
    0.05: '5',
    0.1: '10',
    0.2: '20',
    0.3: '30',
  };
  const opacitySuffix = opacityMap[opacity] || '10';
  return `bg-accent-${colorKey}/${opacitySuffix}`;
};

/**
 * Find color definition by key
 */
export const getColorDefinition = (colorKey: ColumnColor): ColorDefinition | undefined => {
  return COLUMN_COLORS.find(c => c.key === colorKey);
};
