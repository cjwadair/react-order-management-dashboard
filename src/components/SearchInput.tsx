import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
  icon?: IconDefinition
  className?: string
  inputClassName?: string
  iconClassName?: string
}

const defaultClassName = 'relative text-base text-slate-600'

const defaultInputClassName =
  'block w-full rounded-md border border-slate-400 bg-white py-2 pl-9 pr-3 focus:border-slate-500 focus:ring-slate-500 sm:text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400'

const defaultIconClassName = 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500'

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  ariaLabel,
  icon = faMagnifyingGlass,
  className,
  inputClassName,
  iconClassName,
}: SearchInputProps) {
  return (
    <div className={className ?? defaultClassName}>
      <FontAwesomeIcon icon={icon} className={iconClassName ?? defaultIconClassName} />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={inputClassName ?? defaultInputClassName}
      />
    </div>
  )
}