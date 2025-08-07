import { DiagramProps } from '@/types/diagram';
import { LOCAL_STORAGE_KEYS, DIAGRAM_TYPES } from './constants';

/**
 * Load diagrams from localStorage
 */
export function loadDiagrams(): DiagramProps[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.DIAGRAMS);
    if (!saved) return [];

    const diagrams = JSON.parse(saved) as DiagramProps[];
    return diagrams.sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  } catch (error) {
    console.error('Failed to load diagrams:', error);
    return [];
  }
}

/**
 * Save diagrams to localStorage
 */
export function saveDiagrams(diagrams: DiagramProps[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.DIAGRAMS, JSON.stringify(diagrams));
  } catch (error) {
    console.error('Failed to save diagrams:', error);
    throw new Error('Failed to save diagrams');
  }
}

/**
 * Save or update a single diagram
 */
export function saveDiagram(name: string, content: string): void {
  const diagrams = loadDiagrams();
  const timestamp = new Date().toISOString();

  const existingIndex = diagrams.findIndex((d) => d.name === name);

  if (existingIndex !== -1) {
    // Update existing diagram
    diagrams[existingIndex] = {
      ...diagrams[existingIndex],
      content,
      lastUpdated: timestamp,
    };
  } else {
    // Add new diagram
    diagrams.push({
      name,
      content,
      lastUpdated: timestamp,
    });
  }

  saveDiagrams(diagrams);
}

/**
 * Load a specific diagram by name
 */
export function loadDiagram(name: string): DiagramProps | null {
  const diagrams = loadDiagrams();
  return diagrams.find((d) => d.name === name) || null;
}

/**
 * Delete a diagram by name
 */
export function deleteDiagram(name: string): DiagramProps[] {
  const diagrams = loadDiagrams();
  const updated = diagrams.filter((d) => d.name !== name);
  saveDiagrams(updated);
  return updated;
}

/**
 * Determine diagram type from content
 */
export function getDiagramType(content: string): string {
  const firstLine = content.trim().split('\n')[0].toLowerCase();

  for (const [key, value] of Object.entries(DIAGRAM_TYPES)) {
    if (firstLine.includes(key)) {
      return value;
    }
  }

  return 'Diagram';
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const daySuffix =
    day === 1 || day === 21 || day === 31
      ? 'st'
      : day === 2 || day === 22
        ? 'nd'
        : day === 3 || day === 23
          ? 'rd'
          : 'th';
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = String(date.getFullYear()).slice(-2);
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${day}${daySuffix} ${month} '${year}, ${hours}:${mins}`;
}

/**
 * Validate diagram name
 */
export function validateDiagramName(name: string): {
  isValid: boolean;
  error?: string;
} {
  if (!name.trim()) {
    return { isValid: false, error: 'Diagram name cannot be empty' };
  }

  if (name.length > 100) {
    return {
      isValid: false,
      error: 'Diagram name is too long (max 100 characters)',
    };
  }

  // Check for invalid characters that might cause issues
  if (/[<>:"/\\|?*]/.test(name)) {
    return {
      isValid: false,
      error: 'Diagram name contains invalid characters',
    };
  }

  return { isValid: true };
}
