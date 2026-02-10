import { AccessibilityInfo } from '../../types';

interface AccessibilityBadgesProps {
  accessibility: AccessibilityInfo;
  compact?: boolean;
}

export default function AccessibilityBadges({
  accessibility,
  compact = false,
}: AccessibilityBadgesProps) {
  const badges = [
    {
      key: 'wheelchairAccessible',
      label: 'Rollstuhlgerecht',
      icon: '♿',
      active: accessibility.wheelchairAccessible,
    },
    {
      key: 'hearingLoop',
      label: 'Induktionsschleife',
      icon: '🦻',
      active: accessibility.hearingLoop,
    },
    {
      key: 'signLanguage',
      label: 'Gebärdensprache',
      icon: '🤟',
      active: accessibility.signLanguage,
    },
    {
      key: 'easyLanguage',
      label: 'Leichte Sprache',
      icon: '📖',
      active: accessibility.easyLanguage,
    },
  ].filter((badge) => badge.active);

  if (badges.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex gap-1" aria-label="Barrierefreiheit">
        {badges.map(({ key, label, icon }) => (
          <span
            key={key}
            className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
            title={label}
            aria-label={label}
          >
            {icon}
          </span>
        ))}
      </div>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Barrierefreiheit">
      {badges.map(({ key, label, icon }) => (
        <li
          key={key}
          className="inline-flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
        >
          <span aria-hidden="true" className="mr-2">
            {icon}
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}
