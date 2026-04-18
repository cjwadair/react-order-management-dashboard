import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DropdownFilter } from './DropdownFilter'

afterEach(() => {
  cleanup()
})

describe('DropdownFilter', () => {
  it('renders placeholder when no selected value exists', () => {
    const onSelect = vi.fn()

    render(
      <DropdownFilter
        options={['Pending', 'Approved'] as const}
        selectedValue={undefined}
        onSelect={onSelect}
        placeholderLabel="Status"
      />,
    )

    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders selected value label when selected value exists', () => {
    const onSelect = vi.fn()

    render(
      <DropdownFilter
        options={['Pending', 'Approved'] as const}
        selectedValue="Approved"
        onSelect={onSelect}
        placeholderLabel="Status"
        getTriggerLabel={(selected) => `Status: ${selected ?? 'Any'}`}
      />,
    )

    expect(screen.getByText('Status: Approved')).toBeInTheDocument()
  })

  it('calls onSelect with selected option', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <DropdownFilter
        options={['Pending', 'Approved'] as const}
        selectedValue={undefined}
        onSelect={onSelect}
        placeholderLabel="Status"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Pending' }))

    expect(onSelect).toHaveBeenCalledWith('Pending')
  })

  it('calls onSelect with undefined when clear option is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <DropdownFilter
        options={['Pending', 'Approved'] as const}
        selectedValue="Pending"
        onSelect={onSelect}
        placeholderLabel="Status"
        clearLabel="Any Status"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Any Status' }))

    expect(onSelect).toHaveBeenCalledWith(undefined)
  })

  it('supports object options with custom label, key, and trigger formatter', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const options = [
      { id: 1, value: 'P', label: 'Pending' },
      { id: 2, value: 'A', label: 'Approved' },
    ] as const

    render(
      <DropdownFilter
        options={options}
        selectedValue={undefined}
        onSelect={onSelect}
        placeholderLabel="Order Status"
        clearLabel="Any Status"
        getOptionLabel={(option) => option.label}
        getOptionKey={(option) => String(option.id)}
        getTriggerLabel={(selected) => `Order Status: ${selected?.label ?? 'Any'}`}
      />,
    )

    expect(screen.getByText('Order Status: Any')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Approved' }))

    expect(onSelect).toHaveBeenCalledWith(options[1])
  })
})
