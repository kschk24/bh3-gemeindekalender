export const ACCESSIBILITY_OPTIONS = [
  { key: 'wheelchairAccessible', label: 'Rollstuhlgerecht', icon: '♿' },
  { key: 'hearingLoop', label: 'Induktionsschleife', icon: '🦻' },
  { key: 'signLanguage', label: 'Gebärdensprache', icon: '🤟' },
  { key: 'easyLanguage', label: 'Leichte Sprache', icon: '📖' },
] as const;

export type AccessibilityKey = (typeof ACCESSIBILITY_OPTIONS)[number]['key'];
