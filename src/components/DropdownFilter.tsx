import { useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'

type DropdownFilterProps<T> = {
  options: readonly T[]
  selectedValue: T | undefined
  onSelect: (value: T | undefined) => void
  placeholderLabel: string
  clearLabel?: string
  getOptionLabel?: (option: T) => string
  getTriggerLabel?: (selected: T | undefined, placeholder: string) => string
  getOptionKey?: (option: T) => string
  className?: string
  triggerClassName?: string
  menuClassName?: string
  optionClassName?: string
}

const defaultTriggerClassName =
  'inline-flex list-none cursor-pointer items-center rounded-md border border-slate-400 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 [&::-webkit-details-marker]:hidden dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'

const defaultMenuClassName =
  'absolute left-0 z-10 mt-2 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800'

const defaultOptionClassName =
  'block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'

export function DropdownFilter<T>({
  options,
  selectedValue,
  onSelect,
  placeholderLabel,
  clearLabel,
  getOptionLabel = (option) => String(option),
  getTriggerLabel,
  getOptionKey = (option) => String(option),
  className,
  triggerClassName,
  menuClassName,
  optionClassName,
}: DropdownFilterProps<T>) {
  const detailsRef = useRef<HTMLDetailsElement>(null)

  function close() {
    detailsRef.current?.removeAttribute('open')
  }

  const triggerLabel = getTriggerLabel
    ? getTriggerLabel(selectedValue, placeholderLabel)
    : selectedValue !== undefined
      ? getOptionLabel(selectedValue)
      : placeholderLabel

  return (
    <details className={className ?? 'relative'} ref={detailsRef}>
      <summary className={triggerClassName ?? defaultTriggerClassName}>
        <span>{triggerLabel}</span>
        <FontAwesomeIcon icon={faAngleDown} className="ml-2 text-accent-700" />
      </summary>

      <div className={menuClassName ?? defaultMenuClassName}>
        {clearLabel !== undefined && (
          <button
            type="button"
            onClick={() => { onSelect(undefined); close() }}
            className={optionClassName ?? defaultOptionClassName}
          >
            {clearLabel}
          </button>
        )}
        {options.map((option) => (
          <button
            key={getOptionKey(option)}
            type="button"
            onClick={() => { onSelect(option); close() }}
            className={optionClassName ?? defaultOptionClassName}
          >
            {getOptionLabel(option)}
          </button>
        ))}
      </div>
    </details>
  )
}
