import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'

type AiSearchBarProps = {
  onSearch: (query: string) => Promise<void>
  onClearHistory: () => void
  isLoading: boolean
  hasHistory: boolean
  error: string | null
}

export function AiSearchBar({ onSearch, onClearHistory, isLoading, hasHistory, error }: AiSearchBarProps) {
  const [query, setQuery] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed || isLoading) return
    await onSearch(trimmed)
    setQuery('')
  }

  return (
    <div className="page-row">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
        <div className="relative flex-1 text-base text-neutral-600">
          <FontAwesomeIcon
            icon={faWandMagicSparkles}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Ask AI — try "show completed orders for the last 30 days"'
            aria-label="AI search"
            disabled={isLoading}
            className="block w-full rounded-md border border-neutral-400 bg-white py-2 pl-9 pr-3 focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400 disabled:opacity-60"
          />
        </div>
        {hasHistory && (
          <button
            type="button"
            onClick={onClearHistory}
            disabled={isLoading}
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            New search
          </button>
        )}
      </form>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
