// Local storage keys
export const LOCAL_STORAGE_KEYS = {
  DIAGRAMS: 'mermaid-diagrams',
} as const;

// UI constants
export const UI_CONSTANTS = {
  MIN_FONT_SIZE: 10,
  MAX_FONT_SIZE: 24,
  DEFAULT_FONT_SIZE: 14,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 3,
  ZOOM_STEP: 0.2,
  MIN_SEPARATOR_POSITION: 20,
  MAX_SEPARATOR_POSITION: 80,
  DEFAULT_SEPARATOR_POSITION: 50,
  NOTIFICATION_TIMEOUT: 3000,
  DEBOUNCE_DELAY: 300,
  MOBILE_BREAKPOINT: 768,
} as const;

// Default diagram content
export const DEFAULT_DIAGRAM = `graph TD
    A[Client] --> B[Load Balancer]
    B --> C[Server01]
    B --> D[Server02]`;

// Mermaid configuration
export const MERMAID_CONFIG = {
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
} as const;

// Export formats
export const EXPORT_FORMATS = {
  PNG: 'image/png',
  SVG: 'image/svg+xml',
} as const;

// Diagram types mapping
export const DIAGRAM_TYPES = {
  graph: 'Flowchart',
  sequencediagram: 'Sequence',
  classdiagram: 'Class',
  statediagram: 'State',
  erdiagram: 'ER',
  journey: 'Journey',
  gantt: 'Gantt',
  pie: 'Pie',
} as const;
