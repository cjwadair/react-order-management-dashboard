import { Fragment, useMemo, useState } from 'react'
import { AddFilterButton } from './AddFilterButton'
import { DateRangeFilter } from './DateRangeFilter'
import { DropdownFilter } from './DropdownFilter'
import { SearchInput } from './SearchInput'

type DropdownPlaceholder = 'Any' | 'All'

type SearchFilterConfig = {
  type: 'search'
  id: string
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  ariaLabel?: string
}

type DateRangeFilterConfig = {
  type: 'dateRange'
  id: string
  label: string
  value: { from: Date | undefined; to: Date }
  onChange: (update: Partial<{ from: Date | undefined; to: Date }>) => void
  onClear: () => void
}

type DropdownFilterConfig = {
  type: 'dropdown'
  id: string
  label: string
  options: readonly string[] | (() => readonly string[])
  selectedValue: string | undefined
  onSelect: (value: string | undefined) => void
  onClear: () => void
  additional?: boolean
  placeholderValue?: DropdownPlaceholder
  clearLabel?: string
}

export type FilterConfig = SearchFilterConfig | DateRangeFilterConfig | DropdownFilterConfig

type FilterBarProps = {
  filters?: readonly FilterConfig[]
  defaultActiveAdditionalFilterIds?: readonly string[]
  filtersClassName?: string
  addFilterButtonLabel?: string
  clearFiltersLabel?: string
}

const defaultFiltersClassName = 'flex flex-wrap items-center gap-4'

function mergeClassName(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base
}

const defaultDropdownMenuClassName =
  'absolute left-0 z-10 mt-2 w-44 rounded-md border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800'

export function FilterBar({
  filters = [],
  defaultActiveAdditionalFilterIds = [],
  filtersClassName,
  addFilterButtonLabel,
  clearFiltersLabel = 'Clear Filters',
}: FilterBarProps) {
  const [activeAdditionalFilterIds, setActiveAdditionalFilterIds] = useState<Set<string>>(
    () => new Set(defaultActiveAdditionalFilterIds),
  )

  function activateAdditionalFilter(filterId: string) {
    setActiveAdditionalFilterIds((previousIds) => {
      if (previousIds.has(filterId)) {
        return previousIds
      }

      const nextIds = new Set(previousIds)
      nextIds.add(filterId)
      return nextIds
    })
  }

  const fixedFilters = useMemo(
    () => filters.filter((f) => f.type !== 'dropdown' || !f.additional),
    [filters],
  )

  const additionalFilters = useMemo(
    () => filters.filter((f): f is DropdownFilterConfig => f.type === 'dropdown' && !!f.additional),
    [filters],
  )

  const activeAdditionalFilters = useMemo(
    () => additionalFilters.filter((f) => activeAdditionalFilterIds.has(f.id)),
    [activeAdditionalFilterIds, additionalFilters],
  )

  function renderFilter(filter: FilterConfig) {
    switch (filter.type) {
      case 'search':
        return (
          <SearchInput
            value={filter.value}
            onChange={filter.onChange}
            placeholder={filter.placeholder}
            ariaLabel={filter.ariaLabel}
          />
        )
      case 'dateRange':
        return (
          <DateRangeFilter
            label={filter.label}
            value={filter.value}
            onChange={filter.onChange}
          />
        )
      case 'dropdown': {
        const resolvedOptions = typeof filter.options === 'function' ? filter.options() : filter.options
        return (
          <DropdownFilter
            options={resolvedOptions}
            selectedValue={filter.selectedValue}
            onSelect={(value) => {
              if (value === undefined) {
                filter.onClear()
                return
              }
              filter.onSelect(value)
            }}
            placeholderValue={filter.placeholderValue ?? 'Any'}
            label={filter.label}
            clearLabel={filter.clearLabel}
            menuClassName={defaultDropdownMenuClassName}
          />
        )
      }
    }
  }

  return (
    <div className="page-row flex justify-between mt-4">
      <div className={mergeClassName(defaultFiltersClassName, filtersClassName)}>
        {fixedFilters.map((filter) => (
          <Fragment key={filter.id}>{renderFilter(filter)}</Fragment>
        ))}
        {activeAdditionalFilters.map((filter) => (
          <Fragment key={filter.id}>{renderFilter(filter)}</Fragment>
        ))}
        <button
          type="button"
          onClick={() => [...fixedFilters, ...activeAdditionalFilters].forEach((f) => f.onClear())}
          className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
          {clearFiltersLabel}
        </button>
      </div>
      <div>
          {additionalFilters.length > 0 && (
            <AddFilterButton
              filters={additionalFilters.map(({ id, label }) => ({ id, label }))}
              activeFilterIds={activeAdditionalFilterIds}
              onActivateFilter={activateAdditionalFilter}
              triggerLabel={addFilterButtonLabel}
            />
          )}
      </div>
    </div>
  )
}
