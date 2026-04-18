import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faPrint, faMoon, faSun, faMagnifyingGlass, faEllipsis, faPlus } from '@fortawesome/free-solid-svg-icons'
import { DropdownFilter } from '../components/DropdownFilter'
import { DateRangeFilter } from '../components/DateRangeFilter'

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

const trackingClassName: Record<OrderTracking, string> = {
  OnTrack: 'bg-emerald-100/50 border border-emerald-100 text-emerald-800',
  AtRisk: 'bg-amber-100/50 border border-amber-100 text-amber-800',
  Delayed: 'bg-red-100/50 border border-red-100 text-red-800',
  Cancelled: 'bg-gray-100/50 border border-gray-100 text-gray-800',
  Completed: 'bg-gray-100/50 border border-gray-100 text-gray-800',
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function parseOrderDate(str: string) {
  const [day, month, year] = str.split(' ')
  return new Date(`${month} ${day}, ${year}`)
}

export function OrdersPage() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilters, setDateFilters] = useState({
    orderDate: { from: undefined as Date | undefined, to: new Date() },
    deliveryDate: { from: undefined as Date | undefined, to: new Date() },
    paymentDate: { from: undefined as Date | undefined, to: new Date() },
  })
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>()

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

      return true
    })
  }, [dateFilters, searchTerm, selectedStatus])

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
        <span className="flex items-center gap-4">
          <div className="relative text-base text-slate-600">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="block w-full rounded-md border border-slate-400 bg-white py-2 pl-9 pr-3 focus:border-slate-500 focus:ring-slate-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
              />
          </div>

          <DateRangeFilter
            label="Order Date"
            value={dateFilters.orderDate}
            onChange={(update) => setDateFilter('orderDate', update)}
          />
          
          <div className="flex items-center text-accent-700 rounded-md gap-2">
            <DropdownFilter
              options={orderStatuses}
              selectedValue={selectedStatus}
              onSelect={(status) => setSelectedStatus(status)}
              placeholderValue='Any'
              label="Order Status"
              menuClassName="absolute left-0 z-10 mt-2 w-44 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <FontAwesomeIcon icon={faPlus} className="font-medium text-accent-700" />
            <span className="ml-1">Filter</span>
          </button>
        </span>
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

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:mx-6 lg:mx-10 xl:px-0 xl:max-w-11/12 2xl:max-w-10/12 xl:mx-auto dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[20%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[20%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead className="bg-accent-200 text-accent-700 dark:bg-slate-800 dark:text-slate-300 align-bottom">
            <tr>
              <th className="w-[10%] px-4 py-3 font-medium">Order Number</th>
              <th className="w-[20%] px-4 py-3 font-medium">Customer</th>
              <th className="w-[10%] px-4 py-3 font-medium">Order Date</th>
              <th className="w-[10%] px-4 py-3 font-medium text-right">Order Total</th>
              <th className="w-[20%] px-4 py-3 font-medium">Sales Rep</th>
              <th className="w-[10%] px-4 py-3 font-medium">Delivery Date</th>
              <th className="w-[10%] px-4 py-3 font-medium text-center"><div className="text-center w-28">Order Status</div></th>
              <th className="w-[10%] px-8 py-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody >
            {filteredOrders.map((order) => (
              <tr className="border-t border-slate-200 dark:border-slate-700" key={order.id}>
                <td className="w-[10%] px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  <div className="flex flex-col">
                    <span>{order.id}</span>
                    {order.exceptionType && (
                      <span className="text-sm text-brand-500 dark:text-slate-400">{order.exceptionType}</span>
                    )}
                  </div>
                </td>
                <td className="w-[20%] px-4 py-3 text-slate-700 dark:text-slate-300">{order.customer}</td>
                <td className="w-[10%] px-4 py-3 text-slate-700 dark:text-slate-300">{order.orderDate}</td>
                <td className="w-[10%] px-4 py-3 text-slate-700 dark:text-slate-300 text-right">{order.total}</td>
                <td className="w-[20%] px-4 py-3 text-slate-700 dark:text-slate-300">{order.salesRep}</td>
                <td className="w-[10%] px-4 py-3 text-slate-700 dark:text-slate-300">{order.deliveryDate}</td>
                <td className="w-[10%] px-4 py-3 text-center">
                  <div className={`rounded-xl px-2.5 py-1 text-sm font-semibold w-28 text-center ${trackingClassName[order.tracking as OrderTracking]}`}>
                    {order.status}
                  </div>
                </td>
                <td className="w-[10%] px-8 py-3 text-slate-700 dark:text-slate-300 text-center">
                  <button type="button" className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300">
                    <FontAwesomeIcon icon={faEllipsis} className="text-2xl" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr className="border-t border-slate-200 dark:border-slate-700">
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  No orders match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}