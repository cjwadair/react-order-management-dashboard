import { useMemo, useState, type ReactNode } from 'react'
import { AddFilterButton } from './AddFilterButton'
import { DropdownFilter } from './DropdownFilter'

type DropdownPlaceholder = 'Any' | 'All'

export interface FilterBarAdditionalFilter<TFilterId extends string> {
  id: TFilterId
  label: string
  options: readonly string[] | (() => readonly string[])
  selectedValue: string | undefined
  onSelect: (value: string | undefined) => void
  placeholderValue?: DropdownPlaceholder
  clearLabel?: string
  menuClassName?: string
}

type FilterBarProps<TFilterId extends string> = {
  filters: ReactNode
  additionalFilters?: readonly FilterBarAdditionalFilter<TFilterId>[]
  defaultActiveAdditionalFilterIds?: readonly TFilterId[]
  filtersClassName?: string
  addFilterButtonLabel?: string
  clearFiltersLabel?: string
  onClearFilters?: () => void
}

const defaultFiltersClassName = 'flex flex-wrap items-center gap-4'

export function FilterBar<TFilterId extends string>({
  filters,
  additionalFilters = [],
  defaultActiveAdditionalFilterIds = [],
  filtersClassName,
  addFilterButtonLabel,
  clearFiltersLabel = 'Clear Filters',
  onClearFilters,
}: FilterBarProps<TFilterId>) {
  const [activeAdditionalFilterIds, setActiveAdditionalFilterIds] = useState<Set<TFilterId>>(
    () => new Set(defaultActiveAdditionalFilterIds),
  )

  function activateAdditionalFilter(filterId: TFilterId) {
    setActiveAdditionalFilterIds((previousIds) => {
      if (previousIds.has(filterId)) {
        return previousIds
      }

      const nextIds = new Set(previousIds)
      nextIds.add(filterId)
      return nextIds
    })
  }

  function deactivateAdditionalFilter(filterId: TFilterId) {
    setActiveAdditionalFilterIds((previousIds) => {
      if (!previousIds.has(filterId)) {
        return previousIds
      }

      const nextIds = new Set(previousIds)
      nextIds.delete(filterId)
      return nextIds
    })
  }

  const activeAdditionalFilters = useMemo(
    () => additionalFilters.filter((filter) => activeAdditionalFilterIds.has(filter.id)),
    [activeAdditionalFilterIds, additionalFilters],
  )

  function clearFilters() {
    activeAdditionalFilters.forEach((filter) => {
      filter.onSelect(undefined)
    })

    onClearFilters?.()
  }

  return (
    <div className={filtersClassName ?? defaultFiltersClassName}>
      {filters}
      {activeAdditionalFilters.map((filter) => {
        const resolvedOptions = typeof filter.options === 'function' ? filter.options() : filter.options

        return (
          <DropdownFilter
            key={filter.id}
            options={resolvedOptions}
            selectedValue={filter.selectedValue}
            onSelect={(value) => {
              filter.onSelect(value)

              if (value === undefined) {
                deactivateAdditionalFilter(filter.id)
              }
            }}
            placeholderValue={filter.placeholderValue ?? 'Any'}
            label={filter.label}
            clearLabel={filter.clearLabel}
            menuClassName={filter.menuClassName}
          />
        )
      })}
      {additionalFilters.length > 0 && (
        <AddFilterButton
          filters={additionalFilters.map(({ id, label }) => ({ id, label }))}
          activeFilterIds={activeAdditionalFilterIds}
          onActivateFilter={activateAdditionalFilter}
          triggerLabel={addFilterButtonLabel}
        />
      )}
      <button
        type="button"
        onClick={clearFilters}
        className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        {clearFiltersLabel}
      </button>
    </div>
  )
}
