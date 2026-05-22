import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faPrint, faMoon, faSun, faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { FilterBar, type FilterConfig } from '../components/FilterBar'
import { GridTable, type GridColumn, type SortState } from '../components/GridTable'
import { capitalizeWords, formattedDate } from '../utils/formatters'

const orderStatuses = ['pending', 'approved', 'processing', 'shipped', 'delivered', 'completed'] as const

type OrderStatus = (typeof orderStatuses)[number]

type Order = {
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

const orderTableColumns: readonly GridColumn<Order>[] = [
  {
    field: 'id',
    header: 'Order Number',
    customCell: (order) => (
      <div className="flex flex-col">
        <span>{order.id}</span>
        {order.exceptionType && (
          <span className="text-sm text-brand-500 dark:text-neutral-400">{order.exceptionType}</span>
        )}
      </div>
    ),
  },
  {
    field: 'customer',
    span: 2,
  },
  {
    field: 'orderDate',
    initialSortOrder: 'desc',
    valueFormatter: (value) => formattedDate(parseOrderDate(value as string)),
  },
  {
    field: 'orderTotal',
    align: 'right',
    valueFormatter: (value) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', currencySign: 'accounting' }).format(value as number),
  },
  {
    field: 'salesRep',
  },
  {
    field: 'deliveryDate',
    initialSortOrder: 'desc',
    valueFormatter: (value) => formattedDate(parseOrderDate(value as string)),
  },
  {
    field: 'orderStatus',
    header: 'Order Status',
    align: 'center',
    customCell: (order) => {
      return (
        <div className="flex justify-center">
          <span className="w-full px-2 py-1 text-sm font-medium bg-green-500/15 text-green-800 rounded-full">{capitalizeWords(order.orderStatus)}</span>
        </div>
      )
    },
  },
  {
    key: 'actions',
    customCell: <FontAwesomeIcon icon={faEllipsis} className="text-xl text-brand-500" />,
    align: 'center'
  },
]

function parseOrderDate(str: string) {
  // ISO format from API: "2026-04-10" — parse as local date to avoid UTC offset shift
  const [year, month, day] = str.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getUniqueDeliveryDates(orders: Order[]): string[] {
  const dates = new Set(orders.map((order) => order.deliveryDate))
  return Array.from(dates).sort()
}

function getUniqueSalesReps(orders: Order[]): string[] {
  const reps = new Set(orders.map((order) => order.salesRep))
  return Array.from(reps).sort()
}

function getUniqueCustomers(orders: Order[]): string[] {
  const customers = new Set(orders.map((order) => order.customer))
  return Array.from(customers).sort()
}

type AdditionalFilterId = 'deliveryDate' | 'salesRep' | 'customer'

type AdditionalFilterValues = Partial<Record<AdditionalFilterId, string>>

function getDefaultDateFilters() {
  return {
    orderDate: { from: undefined as Date | undefined, to: new Date() },
    deliveryDate: { from: undefined as Date | undefined, to: new Date() },
    paymentDate: { from: undefined as Date | undefined, to: new Date() },
  }
}

export function OrdersPage() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilters, setDateFilters] = useState(getDefaultDateFilters)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>()
  const [sort, setSort] = useState<SortState<Order>>({ field: 'orderDate', order: 'desc' })
  const [additionalFilterValues, setAdditionalFilterValues] = useState<AdditionalFilterValues>({})

  useEffect(() => {
    const params = new URLSearchParams()

    if (searchTerm.trim()) params.set('search', searchTerm.trim())
    if (selectedStatus) params.set('status', selectedStatus)
    if (dateFilters.orderDate.from) params.set('order_date_from', dateFilters.orderDate.from.toISOString().slice(0, 10))
    if (dateFilters.orderDate.to) params.set('order_date_to', dateFilters.orderDate.to.toISOString().slice(0, 10))
    if (additionalFilterValues.deliveryDate) params.set('delivery_date', additionalFilterValues.deliveryDate)
    if (additionalFilterValues.salesRep) params.set('sales_rep', additionalFilterValues.salesRep)
    if (additionalFilterValues.customer) params.set('customer', additionalFilterValues.customer)
    params.set('sort_by', sort.field.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`))
    params.set('sort_order', sort.order)

    const query = params.size > 0 ? `?${params}` : ''

    fetch(`/api/v1/sales_orders${query}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`)
        return res.json() as Promise<SalesOrderResponse[]>
      })
      .then((data) => setOrders(data.map(mapOrder)))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load orders'))
      .finally(() => setIsLoading(false))
  }, [searchTerm, dateFilters, selectedStatus, additionalFilterValues, sort])

  function setAdditionalFilterValue(filterId: AdditionalFilterId, value: string | undefined) {
    setAdditionalFilterValues((prev) => ({ ...prev, [filterId]: value }))
  }

  function setDateFilter(key: keyof typeof dateFilters, update: Partial<{ from: Date | undefined; to: Date }>) {
    setDateFilters((prev) => ({ ...prev, [key]: { ...prev[key], ...update } }))
  }

  const filters = useMemo<FilterConfig[]>(() => [
    {
      type: 'search',
      id: 'search',
      value: searchTerm,
      onChange: setSearchTerm,
      onClear: () => setSearchTerm(''),
      placeholder: 'Search orders...',
      ariaLabel: 'Search orders',
    },
    {
      type: 'dateRange',
      id: 'orderDate',
      label: 'Order Date',
      value: dateFilters.orderDate,
      onChange: (update) => setDateFilter('orderDate', update),
      onClear: () => setDateFilter('orderDate', { from: undefined, to: new Date() }),
    },
    {
      type: 'dropdown',
      id: 'status',
      label: 'Order Status',
      options: orderStatuses,
      selectedValue: selectedStatus,
      onSelect: (value) => setSelectedStatus(value as OrderStatus | undefined),
      onClear: () => setSelectedStatus(undefined),
      placeholderValue: 'Any',
    },
    {
      type: 'dropdown',
      id: 'deliveryDate',
      label: 'Delivery Date',
      options: () => getUniqueDeliveryDates(orders),
      selectedValue: additionalFilterValues.deliveryDate,
      onSelect: (value) => setAdditionalFilterValue('deliveryDate', value),
      onClear: () => setAdditionalFilterValue('deliveryDate', undefined),
      placeholderValue: 'Any',
      additional: true,
    },
    {
      type: 'dropdown',
      id: 'salesRep',
      label: 'Sales Rep',
      options: () => getUniqueSalesReps(orders),
      selectedValue: additionalFilterValues.salesRep,
      onSelect: (value) => setAdditionalFilterValue('salesRep', value),
      onClear: () => setAdditionalFilterValue('salesRep', undefined),
      placeholderValue: 'Any',
      additional: true,
    },
    {
      type: 'dropdown',
      id: 'customer',
      label: 'Customer',
      options: () => getUniqueCustomers(orders),
      selectedValue: additionalFilterValues.customer,
      onSelect: (value) => setAdditionalFilterValue('customer', value),
      onClear: () => setAdditionalFilterValue('customer', undefined),
      placeholderValue: 'Any',
      additional: true,
    },
  ], [orders, searchTerm, dateFilters.orderDate, selectedStatus, additionalFilterValues])

  function toggleDark() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
  }

  function renderTableContent() {
    if (error) {
      return (
        <div className="border-t border-neutral-200 dark:border-neutral-700">
          <div className="px-4 py-8 text-center text-red-600 dark:text-red-400">{error}</div>
        </div>
      )
    }
    if (isLoading) {
      return (
        <div className="border-t border-neutral-200 dark:border-neutral-700">
          <div className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">Loading orders...</div>
        </div>
      )
    }
    return (
      <GridTable<Order>
        items={orders}
        columns={orderTableColumns}
        totalColumns={9}
        getRowKey={(order) => order.id}
        sort={sort}
        onSortChange={setSort}
        emptyState={(
          <div className="border-t border-neutral-200 dark:border-neutral-700">
            <div className="px-4 py-8 text-center text-neutral-600 dark:text-neutral-400">
              No orders match your filters.
            </div>
          </div>
        )}
      />
    )
  }

  return (
    <section className="space-y-5 w-full">
      <div className="w-full dark:bg-neutral-900">
        <div className="mx-auto flex h-14 w-full items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-0 xl:max-w-11/12 2xl:max-w-10/12 mt-2">
          <div>
            <h2 className="text-xl text-neutral-800 font-medium tracking-tight dark:text-neutral-100">Sales Orders</h2>
          </div>
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleDark}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-accent-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-neutral-400"
                aria-label="Toggle dark mode"
              >
                {isDark
                  ? <FontAwesomeIcon icon={faSun} className="text-lg" />
                  : <FontAwesomeIcon icon={faMoon} className="text-lg" />}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-x-2 text-right text-base leading-4 dark:text-neutral-100">
                <div className="text-neutral-800 font-medium">Person Name</div>
                <div className="text-accent-700 text-sm dark:text-neutral-400">Company Name</div>
              </div>
              <div className="flex items-center rounded-full bg-accent-200 px-2 py-1 text-lg font-semibold text-accent-800 dark:bg-neutral-700 dark:text-neutral-100">PN</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-0 xl:max-w-11/12 2xl:max-w-10/12 mt-8 mb-4">
        <FilterBar
          filters={filters}
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-brand-500 border-box px-3 py-2 text-sm text-white hover:bg-brand-600"
          >
            Add Order
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <FontAwesomeIcon icon={faDownload} className="text-lg text-accent-800" />
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <FontAwesomeIcon icon={faPrint} className="text-lg text-accent-800" />
          </button>
        </div>
      </div>

      {renderTableContent()}
    </section>
  )
}
