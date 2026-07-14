import { useState } from 'react'
import { useGrocery } from '../store/GroceryContext'
import { ShoppingBag, CheckCheck, Trash2, CheckCircle2, Plus, Receipt } from 'lucide-react'
import GroceryItemRow from './GroceryItemRow'
import EmptyState from './EmptyState'
import ConfirmClearModal from './ConfirmClearModal'
import AddItemModal from './AddItemModal'
import SetPriceModal from './SetPriceModal'
import DigitalReceiptModal from './DigitalReceiptModal'

export default function GroceryListView() {
  const { state, actions } = useGrocery()
  const { items = [] } = state
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [pricingModalItem, setPricingModalItem] = useState(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)

  const uncheckedItems = items.filter((i) => !i.isChecked)
  const checkedItems = items.filter((i) => i.isChecked)

  const onCartTotal = checkedItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0,
  )

  function handleToggleClick(item) {
    if (!item.isChecked) {
      // Before marking on cart, open modal for pricing per pcs
      setPricingModalItem(item)
    } else {
      // Unchecking back to 'To Buy'
      actions.toggleItem({ id: item.id })
    }
  }

  function handleConfirmPrice({ id, price }) {
    actions.updatePrice({ id, price })
    actions.toggleItem({ id })
    setPricingModalItem(null)
  }

  return (
    <div className="px-6 pb-24 overflow-x-hidden">
      {/* Top Bar: Summary pill & Add Item Button */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {items.length > 0 ? (
          <div className="flex items-center gap-1.5 rounded-full bg-surface border border-border/80 px-3.5 py-1.5 text-xs font-bold text-warm-dark">
            <CheckCircle2 className="h-4 w-4 text-green" />
            <span className="font-mono tabular-nums">
              {checkedItems.length}/{items.length}
            </span>
            <span className="text-[11px] text-warm-gray font-normal ml-0.5">on cart</span>
          </div>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-xl bg-green px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-green-light active:scale-[0.98] flex items-center gap-1.5 shadow-none ml-auto"
        >
          <Plus className="h-4 w-4 stroke-2" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Main List Section */}
      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6 text-warm-gray stroke-[1.75]" />}
            title="Your grocery list is empty"
            description="Click Add Item above to start checking things off."
          />
        ) : (
          <div className="space-y-10">
            {uncheckedItems.length > 0 && (
              <div>
                <h2 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-warm-gray flex items-center justify-between">
                  <span>To Buy ({uncheckedItems.length})</span>
                </h2>
                <div className="divide-y divide-border/50">
                  {uncheckedItems.map((item) => (
                    <GroceryItemRow
                      key={item.id}
                      item={item}
                      onToggle={() => handleToggleClick(item)}
                      onRemove={(id) => actions.removeItem({ id })}
                      onUpdateQuantity={(delta) =>
                        actions.updateQuantity({ id: item.id, delta })
                      }
                      onUpdatePrice={(price) =>
                        actions.updatePrice({ id: item.id, price })
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {checkedItems.length > 0 && (
              <div className="pt-2">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase tracking-widest text-warm-gray">
                    On Cart ({checkedItems.length})
                  </h2>
                  <button
                    type="button"
                    onClick={actions.clearChecked}
                    className="text-xs font-bold text-warm-gray hover:text-danger transition-colors flex items-center gap-1.5"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Clear on cart</span>
                  </button>
                </div>
                <div className="divide-y divide-border/50">
                  {checkedItems.map((item) => (
                    <GroceryItemRow
                      key={item.id}
                      item={item}
                      onToggle={() => handleToggleClick(item)}
                      onRemove={(id) => actions.removeItem({ id })}
                      onUpdateQuantity={(delta) =>
                        actions.updateQuantity({ id: item.id, delta })
                      }
                      onUpdatePrice={(price) =>
                        actions.updatePrice({ id: item.id, price })
                      }
                    />
                  ))}
                </div>

                {/* On Cart Total Price section with divider line */}
                <div className="mt-6 pt-4 border-t-2 border-border/80 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-warm-dark">
                    On Cart Total Price:
                  </span>
                  <span className="text-lg sm:text-xl font-black font-mono text-green tabular-nums">
                    ₱
                    {onCartTotal.toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {/* Generate Digital Receipt Button under On Cart Total Price */}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsReceiptModalOpen(true)}
                    className="rounded-xl bg-green/10 border border-green/30 px-5 py-2.5 text-xs font-black text-green hover:bg-green hover:text-white transition-all active:scale-[0.98] inline-flex items-center gap-2 shadow-none"
                  >
                    <Receipt className="h-4 w-4 stroke-[2.25]" />
                    <span>Generate Digital Receipt</span>
                  </button>
                </div>
              </div>
            )}

            {/* Global Clear All */}
            <div className="pt-8 text-center">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(true)}
                className="rounded-xl border border-border/80 bg-transparent px-5 py-2.5 text-xs font-bold text-warm-gray transition-colors hover:border-danger hover:bg-red-50 hover:text-danger active:scale-[0.98] inline-flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear Entire List</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={actions.addItem}
      />

      {/* Set Price per pcs Modal (Before marking on cart) */}
      <SetPriceModal
        item={pricingModalItem}
        isOpen={Boolean(pricingModalItem)}
        onClose={() => setPricingModalItem(null)}
        onConfirm={handleConfirmPrice}
      />

      {/* Digital Receipt Preview & Download Modal */}
      <DigitalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        checkedItems={checkedItems}
        totalPrice={onCartTotal}
      />

      {/* Confirmation Modal */}
      <ConfirmClearModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={actions.clearAll}
      />
    </div>
  )
}
