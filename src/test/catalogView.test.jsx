import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import CatalogView from '../components/CatalogView'

const mockGrocery = vi.hoisted(() => ({ state: { items: [], catalog: [] }, actions: {} }))

vi.mock('../store/GroceryContext', () => ({
  useGrocery: () => mockGrocery,
}))

function setup({ items = [], catalog = [] } = {}) {
  mockGrocery.state = { items, catalog }
  mockGrocery.actions = {
    batchAddToList: vi.fn(),
    removeFromCatalog: vi.fn(),
    addToCatalog: vi.fn(),
    updateCatalogItem: vi.fn(),
    importCatalog: vi.fn(),
  }
  const onSwitchToList = vi.fn()
  render(<CatalogView onSwitchToList={onSwitchToList} />)
  return { actions: mockGrocery.actions, onSwitchToList }
}

const catalog = [
  { id: 'c1', name: 'Organic Bananas', defaultPrice: 90 },
  { id: 'c2', name: 'Whole Milk', defaultPrice: 110 },
  { id: 'c3', name: 'Brown Rice', defaultPrice: 0 },
]

describe('CatalogView Redesign', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the empty state when the catalog is empty', () => {
    setup()
    expect(screen.getByText(/your staples catalog is empty/i)).toBeDefined()
  })

  it('shows staple count and marks staples already on the list', () => {
    setup({
      items: [{ id: 'i1', name: '  whole milk ', isChecked: false, quantity: 1, price: 0 }],
      catalog,
    })

    expect(screen.getByText('3 staples saved')).toBeDefined()
    expect(screen.getByText('1 on list')).toBeDefined()

    const badges = screen.getAllByText(/^on list$/i)
    expect(badges).toHaveLength(1)
    const milkCheckbox = screen.getByRole('checkbox', { name: /select whole milk/i })
    expect(milkCheckbox.parentElement.textContent).toMatch(/on list/i)
  })

  it('toggles selection and batch adds selected staples to the list', () => {
    const { actions, onSwitchToList } = setup({ catalog })

    expect(screen.queryByText(/staple selected/i)).toBeNull()

    const bananas = screen.getByRole('checkbox', { name: /select organic bananas/i })
    fireEvent.click(bananas)

    expect(bananas.getAttribute('aria-checked')).toBe('true')
    expect(screen.getByText('1 staple selected')).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /add to list/i }))

    expect(actions.batchAddToList).toHaveBeenCalledWith({
      items: [{ name: 'Organic Bananas', quantity: 1, price: 90, catalogId: 'c1' }],
    })
    expect(onSwitchToList).toHaveBeenCalledTimes(1)
  })

  it('select all only selects staples matching the search', () => {
    setup({ catalog })

    fireEvent.change(screen.getByPlaceholderText(/search staples/i), {
      target: { value: 'milk' },
    })

    expect(screen.getByText(/results \(1\)/i)).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: /select all/i }))

    expect(screen.getByText('1 staple selected')).toBeDefined()
    expect(screen.getByRole('button', { name: /deselect all/i })).toBeDefined()
  })

  it('imports a CSV after showing a summary to confirm', async () => {
    const { actions } = setup({ catalog })

    const csv = 'name,defaultPrice\nWhole Milk,120\nGarlic,45\nBad row,abc\n'
    const file = new File([csv], 'staples.csv', { type: 'text/csv' })
    fireEvent.change(screen.getByTestId('catalog-import-input'), { target: { files: [file] } })

    expect(await screen.findByText(/import staples\?/i)).toBeDefined()
    expect(screen.getByText('staples.csv')).toBeDefined()
    const summary = screen.getByRole('list')
    expect(within(summary).getByText('New staples').nextSibling.textContent).toBe('1')
    expect(within(summary).getByText('Price updates').nextSibling.textContent).toBe('1')
    expect(within(summary).getByText('Skipped rows').nextSibling.textContent).toBe('1')

    fireEvent.click(screen.getByRole('button', { name: /^import staples$/i }))

    expect(actions.importCatalog).toHaveBeenCalledWith({
      items: [
        { name: 'Whole Milk', defaultPrice: 120 },
        { name: 'Garlic', defaultPrice: 45 },
      ],
    })
    expect(screen.getByText('Imported staples: 1 new, 1 updated.')).toBeDefined()
  })

  it('offers CSV import from the empty catalog state', () => {
    setup()
    expect(screen.getByRole('button', { name: /import from csv/i })).toBeDefined()
  })

  it('removes a staple after confirming in the delete modal', () => {
    const { actions } = setup({ catalog })

    const milkRow = screen.getByRole('checkbox', { name: /select whole milk/i }).parentElement
    fireEvent.click(within(milkRow).getByRole('button', { name: /^remove$/i }))
    fireEvent.click(screen.getByRole('button', { name: /delete item/i }))

    expect(actions.removeFromCatalog).toHaveBeenCalledWith({ id: 'c2' })
  })
})
