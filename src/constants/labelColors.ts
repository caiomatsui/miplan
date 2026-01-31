export const LABEL_COLORS = [
  { name: 'Red', value: '#EF4444', dark: '#DC2626' },
  { name: 'Orange', value: '#F97316', dark: '#EA580C' },
  { name: 'Yellow', value: '#EAB308', dark: '#CA8A04' },
  { name: 'Green', value: '#22C55E', dark: '#16A34A' },
  { name: 'Teal', value: '#14B8A6', dark: '#0D9488' },
  { name: 'Blue', value: '#3B82F6', dark: '#2563EB' },
  { name: 'Indigo', value: '#6366F1', dark: '#4F46E5' },
  { name: 'Purple', value: '#A855F7', dark: '#9333EA' },
  { name: 'Pink', value: '#EC4899', dark: '#DB2777' },
  { name: 'Gray', value: '#6B7280', dark: '#4B5563' },
] as const;

export type LabelColor = typeof LABEL_COLORS[number];

/**
 * Determines the appropriate text color (black or white) based on the
 * background color's luminance for optimal contrast.
 */
export function getContrastColor(hexColor: string): 'white' | 'black' {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Calculate relative luminance using sRGB coefficients
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? 'black' : 'white';
}

/**
 * Gets the default color for new labels
 */
export function getDefaultLabelColor(): string {
  return LABEL_COLORS[5].value; // Blue
}
