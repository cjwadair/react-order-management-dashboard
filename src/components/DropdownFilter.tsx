import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'

type PlaceholderValue = 'Any' | 'All'

type DropdownFilterProps<T> = {
  options: readonly T[]
  selectedValue: T | undefined
  onSelect: (value: T | undefined) => void
  label: string
  placeholderValue?: PlaceholderValue
  clearLabel?: string
  getOptionLabel?: (option: T) => string
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

function pluralizeWord(word: string) {
  if (word.endsWith('s')) {
    return `${word}es`
  }

  if (word.endsWith('y') && word.length > 1) {
    const previousChar = word[word.length - 2].toLowerCase()
    if (!'aeiou'.includes(previousChar)) {
      return `${word.slice(0, -1)}ies`
    }
  }

  return `${word}s`
}

function pluralizeLabel(label: string) {
  const words = label.trim().split(/\s+/)
  if (words.length === 0) {
    return label
  }

  const lastWord = words[words.length - 1]
  words[words.length - 1] = pluralizeWord(lastWord)
  return words.join(' ')
}

export function DropdownFilter<T>({
  options,
  selectedValue,
  onSelect,
  label,
  placeholderValue,
  clearLabel,
  getOptionLabel = (option) => String(option),
  getOptionKey = (option) => String(option),
  className,
  triggerClassName,
  menuClassName,
  optionClassName,
}: DropdownFilterProps<T>) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [isOpen, setIsOpen] = useState(false)

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

  const resolvedPlaceholderValue = placeholderValue ?? 'All'
  const resolvedLabelValue = resolvedPlaceholderValue === 'Any' ? label : pluralizeLabel(label)
  const resolvedClearLabel = clearLabel ?? `${resolvedPlaceholderValue} ${resolvedLabelValue}`
  const triggerLabel = `${label}: ${selectedValue !== undefined ? getOptionLabel(selectedValue) : resolvedPlaceholderValue}`

  return (
    <div className="flex items-center text-accent-700 rounded-md gap-2">
      <details className={className ?? 'relative'} ref={detailsRef} open={isOpen}>
        <summary
          className={triggerClassName ?? defaultTriggerClassName}
          onClick={(event) => {
            event.preventDefault()
            setIsOpen((prev) => !prev)
          }}
        >
          <span>{triggerLabel}</span>
          <FontAwesomeIcon icon={faAngleDown} className="ml-2 text-accent-700" />
        </summary>

        <div className={menuClassName ?? defaultMenuClassName}>
          <button
            type="button"
            onClick={() => { onSelect(undefined); close() }}
            className={optionClassName ?? defaultOptionClassName}
          >
            {resolvedClearLabel}
          </button>
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
    </div>
  )
}
