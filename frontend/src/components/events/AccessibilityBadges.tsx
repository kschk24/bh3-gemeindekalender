import { Accessibility, Ear, Languages, BookOpen } from 'lucide-react';
import { AccessibilityInfo } from '../../types';

interface AccessibilityBadgesProps {
  accessibility: AccessibilityInfo;
  compact?: boolean;
}

const badges = [
  { key: 'wheelchairAccessible', label: 'Rollstuhlgerecht', Icon: Accessibility },
  { key: 'hearingLoop', label: 'Induktionsschleife', Icon: Ear },
  { key: 'signLanguage', label: 'Gebärdensprache', Icon: Languages },
  { key: 'easyLanguage', label: 'Leichte Sprache', Icon: BookOpen },
] as const;

export default function AccessibilityBadges({
  accessibility,
  compact = false,
}: AccessibilityBadgesProps) {
  const activeBadges = badges.filter((badge) => accessibility[badge.key]);

  if (activeBadges.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex gap-1.5" aria-label="Barrierefreiheit">
        {activeBadges.map(({ key, label, Icon }) => (
          <span
            key={key}
            className="inline-flex items-center justify-center w-9 h-9 bg-primary-100 dark:bg-primary-900/50 rounded-full text-primary-600 dark:text-primary-400 ring-1 ring-primary-200 dark:ring-primary-700"
            title={label}
            aria-label={label}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
          </span>
        ))}
      </div>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Barrierefreiheit">
      {activeBadges.map(({ key, label, Icon }) => (
        <li
          key={key}
          className="inline-flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
        >
          <Icon className="w-4 h-4 mr-2 flex-shrink-0" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}
