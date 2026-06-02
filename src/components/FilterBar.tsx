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
  additional?: boolean
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
  activeAdditionalFilterIds?: Set<string>
  onActiveAdditionalFilterIdsChange?: (ids: Set<string>) => void
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

function filterHasValue(filter: FilterConfig): boolean {
  switch (filter.type) {
    case 'search':    return filter.value !== ''
    case 'dateRange': return filter.value.from !== undefined
    case 'dropdown':  return filter.selectedValue !== undefined
  }
}

export function FilterBar({
  filters = [],
  defaultActiveAdditionalFilterIds = [],
  activeAdditionalFilterIds: controlledActiveIds,
  onActiveAdditionalFilterIdsChange,
  filtersClassName,
  addFilterButtonLabel,
  clearFiltersLabel = 'Clear Filters',
}: FilterBarProps) {
  const [internalActiveIds, setInternalActiveIds] = useState<Set<string>>(
    () => new Set(defaultActiveAdditionalFilterIds),
  )

  const isControlled = controlledActiveIds !== undefined
  const activeAdditionalFilterIds = isControlled ? controlledActiveIds : internalActiveIds

  function setActiveAdditionalFilterIds(updater: (prev: Set<string>) => Set<string>) {
    const next = updater(activeAdditionalFilterIds)
    if (isControlled) {
      onActiveAdditionalFilterIdsChange?.(next)
    } else {
      setInternalActiveIds(next)
    }
  }

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

  function deactivateAdditionalFilter(filterId: string) {
    setActiveAdditionalFilterIds((previousIds) => {
      if (!previousIds.has(filterId)) {
        return previousIds
      }

      const nextIds = new Set(previousIds)
      nextIds.delete(filterId)
      return nextIds
    })
  }

  function clearAllFilters() {
    [...fixedFilters, ...activeAdditionalFilters].forEach((f) => f.onClear())
    activeAdditionalFilterIds.forEach((id) => deactivateAdditionalFilter(id))
  }

  const fixedFilters = useMemo(
    () => filters.filter((f) => !('additional' in f && f.additional)),
    [filters],
  )

  const additionalFilters = useMemo(
    () => filters.filter((f): f is DateRangeFilterConfig | DropdownFilterConfig => 'additional' in f && !!f.additional),
    [filters],
  )

  const activeAdditionalFilters = useMemo(
    () => additionalFilters.filter((f) => activeAdditionalFilterIds.has(f.id)),
    [activeAdditionalFilterIds, additionalFilters],
  )

  const anyFilterHasValue = useMemo(
    () =>
      filters
        .filter((f) => !('additional' in f && f.additional) || activeAdditionalFilterIds.has(f.id))
        .some(filterHasValue),
    [filters, activeAdditionalFilterIds],
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

  function renderAdditionalFilter(filter: DateRangeFilterConfig | DropdownFilterConfig) {
    if (filter.type === 'dateRange') {
      return (
        <DateRangeFilter
          label={filter.label}
          value={filter.value}
          onChange={filter.onChange}
          onClear={() => {
            filter.onClear()
            deactivateAdditionalFilter(filter.id)
          }}
        />
      )
    }

    const resolvedOptions = typeof filter.options === 'function' ? filter.options() : filter.options
    return (
      <DropdownFilter
        options={resolvedOptions}
        selectedValue={filter.selectedValue}
        onSelect={(value) => {
          if (value === undefined) {
            filter.onClear()
            deactivateAdditionalFilter(filter.id)
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

  return (
    <div className="page-row flex justify-between mt-4">
      <div className={mergeClassName(defaultFiltersClassName, filtersClassName)}>
        {fixedFilters.map((filter) => (
          <Fragment key={filter.id}>{renderFilter(filter)}</Fragment>
        ))}
        {activeAdditionalFilters.map((filter) => (
          <Fragment key={filter.id}>{renderAdditionalFilter(filter)}</Fragment>
        ))}
        {anyFilterHasValue && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="button-link"
          >
            {clearFiltersLabel}
          </button>
        )}
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
