import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GroceryProvider } from '../store/GroceryContext'
import AppRoutes from '../routes/AppRoutes'
import BottomNav from '../components/BottomNav'

describe('Navigation and Routes TDD', () => {
  it('renders BottomNav with List and Catalog links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <BottomNav />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /list/i })).toBeDefined()
    expect(screen.getByRole('link', { name: /catalog/i })).toBeDefined()
  })

  it('navigates to GroceryListPage on / route', () => {
    render(
      <GroceryProvider>
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
        </MemoryRouter>
      </GroceryProvider>
    )

    // Should render To Buy or Empty State of GroceryListView
    expect(screen.getAllByText(/grocery list is empty|to buy/i).length).toBeGreaterThan(0)
  })

  it('navigates to StapleCatalogPage on /catalog route', () => {
    render(
      <GroceryProvider>
        <MemoryRouter initialEntries={['/catalog']}>
          <AppRoutes />
        </MemoryRouter>
      </GroceryProvider>
    )

    // Should render Staple Catalog Hub header or search bar
    expect(screen.getByPlaceholderText(/search staples/i)).toBeDefined()
  })
})
