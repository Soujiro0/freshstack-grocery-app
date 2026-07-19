import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'

describe('UI Redesign & Modal TDD', () => {
  it('renders ConfirmDeleteModal when isOpen is true', () => {
    const handleConfirm = vi.fn()
    const handleClose = vi.fn()

    render(
      <ConfirmDeleteModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        itemName="Organic Soy Milk"
      />
    )

    expect(screen.getByText(/delete item\?/i)).toBeDefined()
    expect(screen.getByText(/organic soy milk/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /delete item/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined()
  })

  it('calls onConfirm when delete button is clicked', () => {
    const handleConfirm = vi.fn()
    const handleClose = vi.fn()

    render(
      <ConfirmDeleteModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        itemName="Almond Milk"
      />
    )

    const deleteBtn = screen.getByRole('button', { name: /delete item/i })
    fireEvent.click(deleteBtn)
    expect(handleConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when cancel button is clicked', () => {
    const handleConfirm = vi.fn()
    const handleClose = vi.fn()

    render(
      <ConfirmDeleteModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        itemName="Almond Milk"
      />
    )

    const cancelBtn = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
