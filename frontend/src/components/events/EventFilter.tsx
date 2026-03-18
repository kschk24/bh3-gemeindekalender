import { useState } from 'react';
import { EventFilters, Category } from '../../types';
import { ACCESSIBILITY_OPTIONS } from '../../constants/accessibility';
import Input from '../common/Input';
import Button from '../common/Button';

interface EventFilterProps {
  filters: EventFilters;
  categories: Category[];
  onFilterChange: (filters: Partial<EventFilters>) => void;
}

export default function EventFilter({
  filters,
  categories,
  onFilterChange,
}: EventFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const accessibilityOptions = ACCESSIBILITY_OPTIONS;

  const hasActiveFilters =
    filters.search ||
    filters.categoryId ||
    filters.startDate ||
    filters.endDate ||
    filters.wheelchairAccessible ||
    filters.hearingLoop ||
    filters.signLanguage ||
    filters.easyLanguage;

  return (
    <div className="card space-y-4">
      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Veranstaltungen suchen..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            aria-label="Suche"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="filter-panel"
        >
          Filter {isExpanded ? '▲' : '▼'}
        </Button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div id="filter-panel" className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Category & Date Row */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label
                htmlFor="category-filter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Kategorie
              </label>
              <select
                id="category-filter"
                value={filters.categoryId || ''}
                onChange={(e) => onFilterChange({ categoryId: e.target.value || undefined })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Alle Kategorien</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label
                htmlFor="start-date-filter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Von
              </label>
              <input
                id="start-date-filter"
                type="date"
                value={filters.startDate?.split('T')[0] || ''}
                onChange={(e) =>
                  onFilterChange({
                    startDate: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label
                htmlFor="end-date-filter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Bis
              </label>
              <input
                id="end-date-filter"
                type="date"
                value={filters.endDate?.split('T')[0] || ''}
                onChange={(e) =>
                  onFilterChange({
                    endDate: e.target.value ? `${e.target.value}T23:59:59.999Z` : undefined,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Accessibility Filters */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Barrierefreiheit
            </legend>
            <div className="flex flex-wrap gap-2">
              {accessibilityOptions.map(({ key, label, Icon }) => (
                <label
                  key={key}
                  className={`inline-flex items-center px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    filters[key]
                      ? 'bg-primary-100 dark:bg-primary-900 border-primary-500 text-primary-700 dark:text-primary-300'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters[key] || false}
                    onChange={(e) => onFilterChange({ [key]: e.target.checked || undefined })}
                    className="sr-only"
                  />
                  <Icon className="w-4 h-4 mr-2 flex-shrink-0" aria-hidden="true" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={() =>
                onFilterChange({
                  search: undefined,
                  categoryId: undefined,
                  startDate: undefined,
                  endDate: undefined,
                  wheelchairAccessible: undefined,
                  hearingLoop: undefined,
                  signLanguage: undefined,
                  easyLanguage: undefined,
                })
              }
            >
              Filter zurücksetzen
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
