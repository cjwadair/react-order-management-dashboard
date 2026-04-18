import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the orders page content on /orders route', () => {
    render(
      <MemoryRouter initialEntries={['/orders']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Sales Orders' })).toBeInTheDocument()
    expect(screen.getByText('ORD-1001')).toBeInTheDocument()
  })
})