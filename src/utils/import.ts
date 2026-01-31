/**
 * Import utility for parsing text content into tasks
 */

export interface ParsedLine {
  id: string;
  title: string;
  hasUrl: boolean;
  selected: boolean;
}

/**
 * Parse text content into an array of parsed lines
 * Each non-empty line becomes a potential task
 */
export const parseTextFile = (content: string): ParsedLine[] => {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => ({
      id: crypto.randomUUID(),
      title: line,
      hasUrl: /https?:\/\/|www\./i.test(line),
      selected: true,
    }));
};

/**
 * Validate that a file is a .txt file
 */
export const isValidTextFile = (file: File): boolean => {
  return (
    file.name.endsWith('.txt') ||
    file.type === 'text/plain' ||
    file.type === ''
  );
};

/**
 * Read file content as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
};
