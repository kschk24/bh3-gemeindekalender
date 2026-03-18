import type { LucideIcon } from 'lucide-react';
import { Accessibility, Ear, Languages, BookOpen } from 'lucide-react';

export type AccessibilityKey = 'wheelchairAccessible' | 'hearingLoop' | 'signLanguage' | 'easyLanguage';

interface AccessibilityOption {
  key: AccessibilityKey;
  label: string;
  Icon: LucideIcon;
}

export const ACCESSIBILITY_OPTIONS: readonly AccessibilityOption[] = [
  { key: 'wheelchairAccessible', label: 'Rollstuhlgerecht', Icon: Accessibility },
  { key: 'hearingLoop', label: 'Induktionsschleife', Icon: Ear },
  { key: 'signLanguage', label: 'Gebärdensprache', Icon: Languages },
  { key: 'easyLanguage', label: 'Leichte Sprache', Icon: BookOpen },
];
