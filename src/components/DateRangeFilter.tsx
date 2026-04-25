import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays, faAngleDown, faXmark } from '@fortawesome/free-solid-svg-icons'
import { DayPicker } from 'react-day-picker'
import { useMemo } from 'react'

type DateRange = { from: Date | undefined; to: Date }

type DateRangeFilterProps = {
  label: string
  value: DateRange
  onChange: (update: Partial<DateRange>) => void
}

function formatDateLabel(date: Date) {
  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

export function DateRangeFilter({ label, value, onChange }: DateRangeFilterProps) {
  const rangeLabel = useMemo(() => {
    return `${label}: ${value.from ? formatDateLabel(value.from) : 'Any'} to ${formatDateLabel(value.to)}`
  }, [label, value])

  return (
    <details className="relative">
      <summary className="inline-flex list-none cursor-pointer items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 [&::-webkit-details-marker]:hidden dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">
        <FontAwesomeIcon icon={faCalendarDays} className="text-accent-800" />
        <span>{rangeLabel}</span>
        <FontAwesomeIcon icon={faAngleDown} className="text-neutral-600" />
      </summary>

      <div className="absolute left-0 z-20 mt-2 rounded-md border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex gap-4">
          <div>
            <div className="mb-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">From</div>
            <DayPicker
              mode="single"
              selected={value.from}
              disabled={{ after: value.to }}
              onSelect={(date) => onChange({ from: date })}
            />
          </div>
          <div className="w-px self-stretch bg-neutral-200 dark:bg-neutral-700" />
          <div>
            <div className="mb-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">To</div>
            <DayPicker
              mode="single"
              selected={value.to}
              disabled={value.from ? { before: value.from } : undefined}
              onSelect={(date) => date && onChange({ to: date })}
            />
          </div>
        </div>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onChange({ from: undefined, to: new Date() })}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <FontAwesomeIcon icon={faXmark} />
            Clear range
          </button>
        </div>
      </div>
    </details>
  )
}
