import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { groceryReducer, ACTION_TYPES, addItem } from '../store/groceryReducer'
import SortControls from '../components/SortControls'
import BottomCartDrawer from '../components/BottomCartDrawer'

describe('Phase 6: Wireframe Layout Replication TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CLEAR_UNCHECKED Reducer Action', () => {
    it('clears only unchecked items from state when CLEAR_UNCHECKED action is dispatched', () => {
      const initialState = {
        items: [
          { id: '1', name: 'Apples', isChecked: false, quantity: 1, price: 10 },
          { id: '2', name: 'Bananas', isChecked: true, quantity: 2, price: 15 },
          { id: '3', name: 'Milk', isChecked: false, quantity: 1, price: 50 },
        ],
        catalog: [],
      }

      const newState = groceryReducer(initialState, { type: 'CLEAR_UNCHECKED' })

      expect(newState.items.length).toBe(1)
      expect(newState.items[0].id).toBe('2')
      expect(newState.items[0].name).toBe('Bananas')
    })
  })

  describe('SortControls Dropdown Menu', () => {
    it('renders a sort button and opens a dropdown menu when clicked', () => {
      const onSortChange = vi.fn()
      render(<SortControls sortOrder="default" onSortChange={onSortChange} />)

      // Dropdown should be hidden initially
      expect(screen.queryByText('Name A → Z')).toBeNull()

      // Click the trigger button
      const triggerButton = screen.getByRole('button', { name: /sort options/i })
      fireEvent.click(triggerButton)

      // Dropdown should now be visible
      const ascOption = screen.getByRole('button', { name: /Name A → Z/i })
      expect(ascOption).toBeDefined()

      // Click an option
      fireEvent.click(ascOption)
      expect(onSortChange).toHaveBeenCalledWith('asc')
    })
  })

  describe('BottomCartDrawer Component', () => {
    it('does not render when checkedItems is empty', () => {
      const { container } = render(
        <BottomCartDrawer checkedItems={[]} onGenerateReceipt={vi.fn()} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('renders total price and toggles generate button drawer when chevron is clicked', () => {
      const checkedItems = [
        { id: '1', name: 'Apples', isChecked: true, quantity: 2, price: 50 }, // total 100
      ]
      const onGenerateReceipt = vi.fn()

      render(
        <BottomCartDrawer
          checkedItems={checkedItems}
          onGenerateReceipt={onGenerateReceipt}
        />
      )

      // Should display On Cart Total: ₱100.00
      expect(screen.getByText(/On Cart Total:/i)).toBeDefined()
      expect(screen.getByText(/₱100\.00/i)).toBeDefined()

      // Generate Receipt button should be hidden or collapsed initially
      expect(screen.queryByRole('button', { name: /generate receipt/i })).toBeNull()

      // Click the chevron toggle button
      const toggleBtn = screen.getByRole('button', { name: /toggle cart drawer/i })
      fireEvent.click(toggleBtn)

      // Now Generate Receipt button should be visible
      const visibleGenerateBtn = screen.getByRole('button', { name: /generate receipt/i })
      expect(visibleGenerateBtn).toBeDefined()

      // Click generate receipt
      fireEvent.click(visibleGenerateBtn)
      expect(onGenerateReceipt).toHaveBeenCalledTimes(1)
    })
  })
})
