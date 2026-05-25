import { useEffect, useRef, useState } from 'react'
import type { SortState } from '../components/GridTable'

export const orderStatuses = ['pending', 'approved', 'processing', 'shipped', 'delivered', 'completed'] as const

export type OrderStatus = (typeof orderStatuses)[number]

export type Order = {
  id: string
  orderType: string
  orderDate: string
  customer: string
  salesRep: string
  orderTotal: number
  deliveryDate: string
  orderStatus: OrderStatus
  exceptionType?: string
}

type SalesOrderResponse = {
  order_number: string
  order_type: string
  order_date: string
  delivery_date: string
  order_status: string
  order_total: number
  consignee: { name: string }
  sales_rep: { name: string }
}

type SalesOrderMeta = {
  page: number
  per_page: number
  total_count: number
  total_pages: number
}

export type AdditionalFilterId = 'deliveryDate' | 'salesRep' | 'customer'

export type AdditionalFilterValues = Partial<Record<AdditionalFilterId, string>>

type UseOrdersParams = {
  searchTerm: string
  orderDateFrom: Date | undefined
  orderDateTo: Date | undefined
  selectedStatus: OrderStatus | undefined
  additionalFilterValues: AdditionalFilterValues
  sort: SortState<Order>
  page: number
}

type UseOrdersResult = {
  orders: Order[]
  isLoading: boolean
  error: string | null
  totalPages: number
}

function mapOrder(o: SalesOrderResponse): Order {
  return {
    id: o.order_number,
    orderType: o.order_type,
    orderDate: o.order_date,
    customer: o.consignee.name,
    salesRep: o.sales_rep.name,
    orderTotal: o.order_total,
    deliveryDate: o.delivery_date,
    orderStatus: o.order_status as OrderStatus,
  }
}

export function useOrders({
  searchTerm,
  orderDateFrom,
  orderDateTo,
  selectedStatus,
  additionalFilterValues,
  sort,
  page,
}: UseOrdersParams): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const prevPageRef = useRef(0)

  useEffect(() => {
    const shouldAppend = page > 1 && page > prevPageRef.current
    prevPageRef.current = page

    const params = new URLSearchParams()
    if (searchTerm.trim()) params.set('search', searchTerm.trim())
    if (selectedStatus) params.set('status', selectedStatus)
    if (orderDateFrom) params.set('order_date_from', orderDateFrom.toISOString().slice(0, 10))
    if (orderDateTo) params.set('order_date_to', orderDateTo.toISOString().slice(0, 10))
    if (additionalFilterValues.deliveryDate) params.set('delivery_date', additionalFilterValues.deliveryDate)
    if (additionalFilterValues.salesRep) params.set('sales_rep', additionalFilterValues.salesRep)
    if (additionalFilterValues.customer) params.set('customer', additionalFilterValues.customer)
    params.set('sort_by', sort.field.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`))
    params.set('sort_order', sort.order)
    if (page > 1) params.set('page', page.toString())

    const query = params.size > 0 ? `?${params}` : ''

    // Only show the loading state for fresh fetches, not silent infinite-scroll appends
    if (!shouldAppend) setIsLoading(true)
    setError(null)

    fetch(`/api/v1/sales_orders${query}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`)
        return res.json() as Promise<{ data: SalesOrderResponse[]; meta: SalesOrderMeta }>
      })
      .then((json) => {
        setOrders((prev) => shouldAppend ? [...prev, ...json.data.map(mapOrder)] : json.data.map(mapOrder))
        setTotalPages(json.meta.total_pages)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load orders'))
      .finally(() => setIsLoading(false))

    return () => { prevPageRef.current = 0 }
  }, [searchTerm, orderDateFrom, orderDateTo, selectedStatus, additionalFilterValues, sort, page])

  return { orders, isLoading, error, totalPages }
}
