import { useMemo } from 'react'
import { orderStatuses, type OrderStatus, type AdditionalFilterValues } from './useOrders'
import { type FilterConfig } from '../components/FilterBar'

type DateFilter = { from: Date | undefined; to: Date }

export type UseOrderFiltersParams = {
  searchTerm: string
  setSearchTerm: (value: string) => void
  dateFilters: {
    orderDate: DateFilter
    deliveryDate: DateFilter
  }
  setDateFilter: (filterId: 'orderDate' | 'deliveryDate', update: Partial<DateFilter>) => void
  selectedStatus: OrderStatus | undefined
  setSelectedStatus: (value: OrderStatus | undefined) => void
  additionalFilterValues: AdditionalFilterValues
  setAdditionalFilterValue: (filterId: keyof AdditionalFilterValues, value: string | undefined) => void
  filterOptions: {
    salesReps: string[]
    customers: string[]
  }
  setPage: (page: number) => void
}

export function useOrderFilters({
  searchTerm, 
  setSearchTerm,
  dateFilters, 
  setDateFilter,
  selectedStatus, 
  setSelectedStatus,
  additionalFilterValues, 
  setAdditionalFilterValue,
  filterOptions, 
  setPage,
}: UseOrderFiltersParams): FilterConfig[] {
    
    return useMemo<FilterConfig[]>(() => [
    
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
      ], [filterOptions, searchTerm, dateFilters.orderDate, dateFilters.deliveryDate, selectedStatus, additionalFilterValues, setSearchTerm, setSelectedStatus, setDateFilter, setAdditionalFilterValue, setPage])
      
}
