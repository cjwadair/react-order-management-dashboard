import { useCallback, useState } from 'react'
import type { OrderStatus } from './useOrders'

export type ParsedFilters = {
  search?: string
  status?: OrderStatus
  order_date_from?: string
  order_date_to?: string
  delivery_date_from?: string
  delivery_date_to?: string
  sales_rep?: string
  customer?: string
}

type HistoryTurn = { query: string; filters: ParsedFilters }

type UseAiSearchResult = {
  parseQuery: (query: string) => Promise<ParsedFilters>
  clearHistory: () => void
  isLoading: boolean
  hasHistory: boolean
  error: string | null
}

export function useAiSearch(): UseAiSearchResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationHistory, setConversationHistory] = useState<HistoryTurn[]>([])

  const clearHistory = useCallback(() => setConversationHistory([]), [])

  async function parseQuery(query: string): Promise<ParsedFilters> {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/parse_query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, history: conversationHistory }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? `Request failed: ${res.status}`)
      }

      const parsed = (await res.json()) as ParsedFilters
      setConversationHistory(prev => [...prev, { query, filters: parsed }].slice(-5))
      return parsed
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI search failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { parseQuery, clearHistory, isLoading, hasHistory: conversationHistory.length > 0, error }
}
