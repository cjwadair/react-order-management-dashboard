import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faPrint, faMoon, faSun, faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { FilterBar, type FilterConfig } from '../components/FilterBar'
import { GridTable, type GridColumn } from '../components/GridTable'

const orderTrackingOptions = ['OnTrack', 'AtRisk', 'Delayed', 'Cancelled', 'Completed'] as const

type OrderTracking = (typeof orderTrackingOptions)[number]

const orderStatuses = ['Pending', 'Approved', 'Fulfillment', 'Shipped', 'Delivered'] as const

type OrderStatus = (typeof orderStatuses)[number]

type Order = {
  id: string
  orderType: string
  orderDate: string
  customer: string
  salesRep: string
  total: string
  deliveryDate: string
  status: OrderStatus
  tracking: OrderTracking
  exceptionType?: string
}

const orders: Order[] = [
  {
    id: 'ORD-1001',
    orderType: 'Delivery',
    orderDate: '10 Apr 2026',
    customer: 'Acme Foods',
    salesRep: 'Jordan Lee',
    total: '$1,240.00',
    deliveryDate: '16 Apr 2026',
    status: 'Pending',
    tracking: 'OnTrack'
  },
  {
    id: 'ORD-1002',
    orderType: 'Return',
    orderDate: '11 Apr 2026',
    customer: 'Northwind Traders',
    salesRep: 'Taylor Kim',
    total: '$(860.50)',
    deliveryDate: '18 Apr 2026',
    status: 'Approved',
    tracking: 'Delayed',
    exceptionType: 'Return'
  },
  {
    id: 'ORD-1003',
    orderType: 'Delivery',
    orderDate: '12 Apr 2026',
    customer: 'Globex Retail',
    salesRep: 'Avery Patel',
    total: '$2,149.99',
    deliveryDate: '19 Apr 2026',
    status: 'Shipped',
    tracking: 'OnTrack'
  },
  {
    id: 'ORD-1004',
    orderType: 'Delivery',
    orderDate: '13 Apr 2026',
    customer: 'Stark Supplies',
    salesRep: 'Morgan Chen',
    total: '$470.00',
    deliveryDate: '20 Apr 2026',
    status: 'Delivered',
    tracking: 'Completed',
    exceptionType: 'Reduced Qty'
  },
]

const orderTableColumns: readonly GridColumn<Order>[] = [
  {
    field: 'id',
    header: 'Order Number',
    customCell: (order) => (
      <div className="flex flex-col">
        <span>{order.id}</span>
        {order.exceptionType && (
          <span className="text-sm text-brand-500 dark:text-slate-400">{order.exceptionType}</span>
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
  },
  {
    field: 'total',
    align: 'right',
  },
  {
    field: 'salesRep',
  },
  {
    field: 'deliveryDate',
  },
  {
    field: 'status',
    header: 'Order Status',
    align: 'center',
  },
  {
    key: 'actions',
    customCell: <FontAwesomeIcon icon={faEllipsis} className="text-xl text-brand-500" />,
    align: 'center'
  },
]

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function parseOrderDate(str: string) {
  const [day, month, year] = str.split(' ')
  return new Date(`${month} ${day}, ${year}`)
}

type AdditionalFilterId = 'deliveryDate' | 'salesRep' | 'customer'

type AdditionalFilterValues = Partial<Record<AdditionalFilterId, string>>

function getUniqueDeliveryDates(): string[] {
  const dates = new Set(orders.map((order) => order.deliveryDate))
  return Array.from(dates).sort()
}

function getUniqueSalesReps(): string[] {
  const reps = new Set(orders.map((order) => order.salesRep))
  return Array.from(reps).sort()
}

function getUniqueCustomers(): string[] {
  const customers = new Set(orders.map((order) => order.customer))
  return Array.from(customers).sort()
}

function getDefaultDateFilters() {
  return {
    orderDate: { from: undefined as Date | undefined, to: new Date() },
    deliveryDate: { from: undefined as Date | undefined, to: new Date() },
    paymentDate: { from: undefined as Date | undefined, to: new Date() },
  }
}

export function OrdersPage() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilters, setDateFilters] = useState(getDefaultDateFilters)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>()
  const [additionalFilterValues, setAdditionalFilterValues] = useState<AdditionalFilterValues>({})

  function setAdditionalFilterValue(filterId: AdditionalFilterId, value: string | undefined) {
    setAdditionalFilterValues((prev) => ({ ...prev, [filterId]: value }))
  }

  function setDateFilter(key: keyof typeof dateFilters, update: Partial<{ from: Date | undefined; to: Date }>) {
    setDateFilters((prev) => ({ ...prev, [key]: { ...prev[key], ...update } }))
  }

  const filteredOrders = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesStatus = !selectedStatus || order.status === selectedStatus

      if (!matchesStatus) {
        return false
      }

      const matchesSearch =
        normalizedSearchTerm.length === 0 ||
        [order.id, order.customer, order.salesRep, order.status].some((value) =>
          value.toLowerCase().includes(normalizedSearchTerm),
        )

      if (!matchesSearch) {
        return false
      }

      const orderDate = normalizeDate(parseOrderDate(order.orderDate))
      const { from, to } = dateFilters.orderDate

      if (from && orderDate < normalizeDate(from)) {
        return false
      }

      if (orderDate > normalizeDate(to)) {
        return false
      }

      const matchesDeliveryDate =
        !additionalFilterValues.deliveryDate || order.deliveryDate === additionalFilterValues.deliveryDate
      if (!matchesDeliveryDate) {
        return false
      }

      const matchesSalesRep = !additionalFilterValues.salesRep || order.salesRep === additionalFilterValues.salesRep
      if (!matchesSalesRep) {
        return false
      }

      const matchesCustomer = !additionalFilterValues.customer || order.customer === additionalFilterValues.customer
      if (!matchesCustomer) {
        return false
      }

      return true
    })
  }, [dateFilters, searchTerm, selectedStatus, additionalFilterValues])

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
      options: getUniqueDeliveryDates,
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
      options: getUniqueSalesReps,
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
      options: getUniqueCustomers,
      selectedValue: additionalFilterValues.customer,
      onSelect: (value) => setAdditionalFilterValue('customer', value),
      onClear: () => setAdditionalFilterValue('customer', undefined),
      placeholderValue: 'Any',
      additional: true,
    },
  ], [searchTerm, dateFilters.orderDate, selectedStatus, additionalFilterValues])

  function toggleDark() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <section className="space-y-5 w-full">
      <div className="w-full border-b border-slate-200 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex h-12 w-full items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-0 xl:max-w-11/12 2xl:max-w-10/12">
          <div>
            <h2 className="text-xl text-accent-900 font-medium tracking-tight dark:text-slate-100">Sales Orders</h2>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleDark}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-accent-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                aria-label="Toggle dark mode"
              >
                {isDark
                  ? <FontAwesomeIcon icon={faSun} className="text-lg" />
                  : <FontAwesomeIcon icon={faMoon} className="text-lg" />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-x-2 text-right text-base leading-4 dark:text-slate-100">
                <div className="text-accent-900 font-medium">Person Name</div>
                <div className="text-slate-500 text-sm dark:text-slate-400">Company Name</div>
              </div>
              <div className="flex items-center rounded-full bg-slate-200 px-2 py-1 text-lg font-semibold text-accent-700 dark:bg-slate-700 dark:text-accent-100">PN</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-0 xl:max-w-11/12 2xl:max-w-10/12 mt-8">
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
            className="inline-flex items-center rounded-md border border-slate-400 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <FontAwesomeIcon icon={faDownload} className="text-lg text-accent-700" />
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-slate-400 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <FontAwesomeIcon icon={faPrint} className="text-lg text-accent-700" />
          </button>
        </div>
      </div>

      <GridTable<Order>
        items={filteredOrders}
        columns={orderTableColumns}
        totalColumns={9}
        getRowKey={(order) => order.id}
        defaultSort={{ field: 'orderDate', order: 'desc' }}
        emptyState={(
          <div className="border-t border-slate-200 dark:border-slate-700">
            <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
              No orders match your filters.
            </div>
          </div>
        )}
      />
    </section>
  )
}