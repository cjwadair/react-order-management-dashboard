import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FilterBar } from './FilterBar'

afterEach(() => {
  cleanup()
})

describe('FilterBar', () => {
  it('renders fixed filters', () => {
    render(<FilterBar filters={<div>Fixed Filters</div>} />)

    expect(screen.getByText('Fixed Filters')).toBeInTheDocument()
  })

  it('activates additional filters from the Add Filter menu', async () => {
    const user = userEvent.setup()

    render(
      <FilterBar
        filters={<div>Fixed Filters</div>}
        additionalFilters={[
          {
            id: 'salesRep',
            label: 'Sales Rep',
            options: ['Jordan Lee', 'Taylor Kim'],
            selectedValue: undefined,
            onSelect: vi.fn(),
          },
        ]}
      />,
    )

    await user.click(screen.getByText('Filter'))
    await user.click(screen.getByRole('button', { name: 'Sales Rep' }))

    expect(screen.getByText('Sales Rep: Any')).toBeInTheDocument()
  })

  it('clears and removes an active additional filter when selecting Any', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <FilterBar
        filters={<div>Fixed Filters</div>}
        defaultActiveAdditionalFilterIds={['salesRep']}
        additionalFilters={[
          {
            id: 'salesRep',
            label: 'Sales Rep',
            options: ['Jordan Lee', 'Taylor Kim'],
            selectedValue: 'Jordan Lee',
            onSelect,
            placeholderValue: 'Any',
          },
        ]}
      />,
    )

    await user.click(screen.getByText('Sales Rep: Jordan Lee'))
    await user.click(screen.getByRole('button', { name: 'Any Sales Rep' }))

    expect(onSelect).toHaveBeenCalledWith(undefined)
    expect(screen.queryByText('Sales Rep: Jordan Lee')).not.toBeInTheDocument()
  })

  it('hides Add Filter button when no additional filters are configured', () => {
    render(<FilterBar filters={<div>Fixed Filters</div>} />)

    expect(screen.queryByText('Filter')).not.toBeInTheDocument()
  })

  it('renders clear filters control', () => {
    render(<FilterBar filters={<div>Fixed Filters</div>} />)

    expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument()
  })

  it('clears active additional filter values without removing them', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <FilterBar
        filters={<div>Fixed Filters</div>}
        defaultActiveAdditionalFilterIds={['salesRep']}
        additionalFilters={[
          {
            id: 'salesRep',
            label: 'Sales Rep',
            options: ['Jordan Lee', 'Taylor Kim'],
            selectedValue: 'Jordan Lee',
            onSelect,
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Clear Filters' }))

    expect(onSelect).toHaveBeenCalledWith(undefined)
    expect(screen.getByText('Sales Rep: Jordan Lee')).toBeInTheDocument()
  })

  it('calls page clear callback when clear filters is clicked', async () => {
    const user = userEvent.setup()
    const onClearFilters = vi.fn()

    render(<FilterBar filters={<div>Fixed Filters</div>} onClearFilters={onClearFilters} />)

    await user.click(screen.getByRole('button', { name: 'Clear Filters' }))

    expect(onClearFilters).toHaveBeenCalledTimes(1)
  })
})
