import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FilterBar, type FilterConfig } from './FilterBar'

afterEach(() => {
  cleanup()
})

const salesRepFilter: FilterConfig = {
  type: 'dropdown',
  id: 'salesRep',
  label: 'Sales Rep',
  options: ['Jordan Lee', 'Taylor Kim'],
  selectedValue: undefined,
  onSelect: vi.fn(),
  onClear: vi.fn(),
  additional: true,
}

describe('FilterBar', () => {
  it('renders a fixed search filter', () => {
    render(<FilterBar filters={[{ type: 'search', id: 'search', value: '', onChange: vi.fn(), onClear: vi.fn() }]} />)

    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('renders a fixed dropdown filter', () => {
    render(
      <FilterBar
        filters={[{
          type: 'dropdown',
          id: 'status',
          label: 'Order Status',
          options: ['Pending', 'Shipped'],
          selectedValue: undefined,
          onSelect: vi.fn(),
          onClear: vi.fn(),
        }]}
      />,
    )

    expect(screen.getByText('Order Status: Any')).toBeInTheDocument()
  })

  it('activates additional filters from the Add Filter menu', async () => {
    const user = userEvent.setup()

    render(<FilterBar filters={[salesRepFilter]} />)

    await user.click(screen.getByText('Filter'))
    await user.click(screen.getByRole('button', { name: 'Sales Rep' }))

    expect(screen.getByText('Sales Rep: Any')).toBeInTheDocument()
  })

  it('clears an active additional filter when selecting Any without removing it', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()

    render(
      <FilterBar
        defaultActiveAdditionalFilterIds={['salesRep']}
        filters={[{
          type: 'dropdown',
          id: 'salesRep',
          label: 'Sales Rep',
          options: ['Jordan Lee', 'Taylor Kim'],
          selectedValue: 'Jordan Lee',
          onSelect: vi.fn(),
          onClear,
          additional: true,
          placeholderValue: 'Any',
        }]}
      />,
    )

    await user.click(screen.getByText('Sales Rep: Jordan Lee'))
    await user.click(screen.getByRole('button', { name: 'Any Sales Rep' }))

    expect(onClear).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Sales Rep: Jordan Lee')).toBeInTheDocument()
  })

  it('hides Add Filter button when no additional filters are configured', () => {
    render(<FilterBar filters={[]} />)

    expect(screen.queryByText('Filter')).not.toBeInTheDocument()
  })

  it('renders clear filters control', () => {
    render(<FilterBar filters={[]} />)

    expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument()
  })

  it('calls onClear on all active filters when clear filters is clicked', async () => {
    const user = userEvent.setup()
    const onClearSearch = vi.fn()
    const onClearDropdown = vi.fn()

    render(
      <FilterBar
        defaultActiveAdditionalFilterIds={['salesRep']}
        filters={[
          { type: 'search', id: 'search', value: 'acme', onChange: vi.fn(), onClear: onClearSearch },
          {
            type: 'dropdown',
            id: 'salesRep',
            label: 'Sales Rep',
            options: ['Jordan Lee', 'Taylor Kim'],
            selectedValue: 'Jordan Lee',
            onSelect: vi.fn(),
            onClear: onClearDropdown,
            additional: true,
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Clear Filters' }))

    expect(onClearSearch).toHaveBeenCalledTimes(1)
    expect(onClearDropdown).toHaveBeenCalledTimes(1)
  })

  it('does not call onClear on inactive additional filters when clear filters is clicked', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()

    render(
      <FilterBar
        filters={[{
          type: 'dropdown',
          id: 'salesRep',
          label: 'Sales Rep',
          options: ['Jordan Lee', 'Taylor Kim'],
          selectedValue: undefined,
          onSelect: vi.fn(),
          onClear,
          additional: true,
        }]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Clear Filters' }))

    expect(onClear).not.toHaveBeenCalled()
  })
})
