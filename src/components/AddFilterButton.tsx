import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faPlus } from '@fortawesome/free-solid-svg-icons'

type AddFilterOption<T extends string> = {
  id: T
  label: string
}

type AddFilterButtonProps<T extends string> = {
  filters: readonly AddFilterOption<T>[]
  activeFilterIds: ReadonlySet<T>
  onActivateFilter: (filterId: T) => void
  className?: string
  triggerClassName?: string
  menuClassName?: string
  optionClassName?: string
  triggerLabel?: string
}

const defaultTriggerClassName =
  'inline-flex items-center px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer rounded-md list-none'

const defaultMenuClassName =
  'absolute left-0 z-10 mt-2 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800'

const defaultOptionClassName =
  'block w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700 first:rounded-t-sm last:rounded-b-sm'

export function AddFilterButton<T extends string>({
  filters,
  activeFilterIds,
  onActivateFilter,
  className,
  triggerClassName,
  menuClassName,
  optionClassName,
  triggerLabel = 'Filter',
}: AddFilterButtonProps<T>) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const availableFilters = filters.filter((filter) => !activeFilterIds.has(filter.id))

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handlePointerDown(event: MouseEvent) {
      if (!detailsRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isOpen])

  function close() {
    setIsOpen(false)
  }

  return (
    <details className={className ?? 'relative'} open={isOpen} ref={detailsRef}>
      <summary
        className={triggerClassName ?? defaultTriggerClassName}
        onClick={(event) => {
          event.preventDefault()
          setIsOpen((prev) => !prev)
        }}
      >
        <FontAwesomeIcon icon={faPlus} className="font-medium text-neutral-700" />
        <span className="ml-1">{triggerLabel}</span>
        <FontAwesomeIcon icon={faChevronDown} className="ml-1 text-xs" />
      </summary>
      <div className={menuClassName ?? defaultMenuClassName}>
        {availableFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => {
              onActivateFilter(filter.id)
              close()
            }}
            className={optionClassName ?? defaultOptionClassName}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </details>
  )
}
