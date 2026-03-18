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
      <div className="flex gap-1" aria-label="Barrierefreiheit">
        {activeBadges.map(({ key, label, Icon }) => (
          <span
            key={key}
            className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full text-primary-600 dark:text-primary-400"
            title={label}
            aria-label={label}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
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
