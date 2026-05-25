import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faPrint, faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { FilterBar, type FilterConfig } from '../components/FilterBar'
import { GridTable, type GridColumn, type SortState } from '../components/GridTable'
import { capitalizeWords, formattedDate, parseISODate } from '../utils/formatters'
import {
  useOrders,
  orderStatuses,
  type Order,
  type OrderStatus,
  type AdditionalFilterId,
  type AdditionalFilterValues,
} from '../hooks/useOrders'
import { PageHeader } from '../components/PageHeader'

type FilterOptions = {
  salesReps: string[]
  customers: string[]
}

function getDefaultDateFilters() {
  return {
    orderDate: { from: undefined as Date | undefined, to: new Date() },
    deliveryDate: { from: undefined as Date | undefined, to: new Date() }
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
    valueFormatter: (value) => formattedDate(parseISODate(value as string)),
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
    valueFormatter: (value) => formattedDate(parseISODate(value as string)),
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
    customCell: () => <FontAwesomeIcon icon={faEllipsis} className="text-xl text-brand-500" />,
    align: 'center'
  },
]

export function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilters, setDateFilters] = useState(getDefaultDateFilters)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>()
  const [sort, setSort] = useState<SortState<Order>>({ field: 'orderDate', order: 'desc' })
  const [page, setPage] = useState(1)
  const [additionalFilterValues, setAdditionalFilterValues] = useState<AdditionalFilterValues>({})
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ salesReps: [], customers: [] })

  // Debounce search so network requests only fire once the user pauses
  // typing, rather than on every keystroke.
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const { orders, isLoading, isFetching, error, totalPages } = useOrders({
    searchTerm: debouncedSearchTerm,
    orderDateFrom: dateFilters.orderDate.from,
    orderDateTo: dateFilters.orderDate.to,
    deliveryDateFrom: dateFilters.deliveryDate.from,
    deliveryDateTo: dateFilters.deliveryDate.to,
    selectedStatus,
    additionalFilterValues,
    sort,
    page,
  })

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/v1/filter_options', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch filter options: ${res.status}`)
        return res.json() as Promise<{ sales_reps: string[]; customers: string[] }>
      })
      .then((json) => setFilterOptions({ salesReps: json.sales_reps, customers: json.customers }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // Ignore abort errors which are expected during cleanup
          return
        }
        console.error(err)
      })

    return () => { controller.abort() }
  }, [])


  const setAdditionalFilterValue = useCallback((filterId: AdditionalFilterId, value: string | undefined) => {
    setAdditionalFilterValues((prev) => ({ ...prev, [filterId]: value }))
    setPage(1)
  }, [])

  const setDateFilter = useCallback((key: keyof typeof dateFilters, update: Partial<{ from: Date | undefined; to: Date }>) => {
    setDateFilters((prev) => ({ ...prev, [key]: { ...prev[key], ...update } }))
    setPage(1)
  }, [])

  const handleSortValue = useCallback((s: SortState<Order>) => {
    setSort(s)
    setPage(1)
  }, [])

  const filters = useMemo<FilterConfig[]>(() => [

    {
      type: 'search',
      id: 'search',
      value: searchTerm,
      onChange: (v) => { setSearchTerm(v); setPage(1) },
      onClear: () => { setSearchTerm(''); setPage(1) },
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
      onSelect: (value) => { setSelectedStatus(value as OrderStatus | undefined); setPage(1) },
      onClear: () => { setSelectedStatus(undefined); setPage(1) },
      placeholderValue: 'Any',
    },
    {
      type: 'dateRange',
      id: 'deliveryDate',
      label: 'Delivery Date',
      value: dateFilters.deliveryDate,
      onChange: (update) => setDateFilter('deliveryDate', update),
      onClear: () => setDateFilter('deliveryDate', { from: undefined, to: new Date() }),
    },
    {
      type: 'dropdown',
      id: 'salesRep',
      label: 'Sales Rep',
      options: filterOptions.salesReps,
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
      options: filterOptions.customers,
      selectedValue: additionalFilterValues.customer,
      onSelect: (value) => setAdditionalFilterValue('customer', value),
      onClear: () => setAdditionalFilterValue('customer', undefined),
      placeholderValue: 'Any',
      additional: true,
    },
  ], [filterOptions, searchTerm, dateFilters.orderDate, dateFilters.deliveryDate, selectedStatus, additionalFilterValues, setDateFilter, setAdditionalFilterValue])

  return (
    <section className="space-y-5 w-full">
      <PageHeader title="Sales Orders" />

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
      
      <div className="max-h-screen h-screen">
          {error ? (
            <div className="border-t border-neutral-200 dark:border-neutral-700">
              <div className="px-4 py-8 text-center text-red-600 dark:text-red-400">{error}</div>
            </div>
          ) : isLoading ? (
            <div className="border-t border-neutral-200 dark:border-neutral-700">
              <div className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">Loading orders...</div>
            </div>
          ) : (
            // Keep the table mounted while filters change — stale data stays
            // visible (slightly dimmed) until the new results arrive, avoiding
            // the flash caused by unmounting and remounting the table.
            <div className={`transition-opacity duration-150 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
              <GridTable<Order>
                items={orders}
                columns={orderTableColumns}
                totalColumns={9}
                getRowKey={(order) => order.id}
                sort={sort}
                onSortChange={handleSortValue}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                emptyState={(
                  <div className="border-t border-neutral-200 dark:border-neutral-700">
                    <div className="px-4 py-8 text-center text-neutral-600 dark:text-neutral-400">
                      No orders match your filters.
                    </div>
                  </div>
                )}
              />
            </div>
          )}
      </div>
    </section>
  )
}
