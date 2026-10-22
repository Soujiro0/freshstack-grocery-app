import { useState, useMemo, useCallback } from 'react'
import { useGrocery } from '../store/GroceryContext'
import { sortItems } from '../store/groceryReducer'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, CheckCheck, Plus } from 'lucide-react'
import GroceryItemRow from './GroceryItemRow'
import EmptyState from './EmptyState'
import ConfirmClearModal from './ConfirmClearModal'
import AddItemModal from './AddItemModal'
import SetPriceModal from './SetPriceModal'
import DigitalReceiptModal from './DigitalReceiptModal'
import SortControls from './SortControls'
import BottomCartDrawer from './BottomCartDrawer'

export default function GroceryListView() {
  const { state, actions } = useGrocery()
  const { items = [] } = state
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [pricingModalItem, setPricingModalItem] = useState(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState('default')

  const uncheckedItems = useMemo(
    () => sortItems(items.filter((i) => !i.isChecked), sortOrder),
    [items, sortOrder]
  )
  
  const checkedItems = useMemo(
    () => sortItems(items.filter((i) => i.isChecked), sortOrder),
    [items, sortOrder]
  )

  const onCartTotal = useMemo(
    () =>
      checkedItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      ),
    [checkedItems]
  )

  const progressPercent = useMemo(
    () => (items.length > 0 ? Math.round((checkedItems.length / items.length) * 100) : 0),
    [items.length, checkedItems.length]
  )

  const handleToggleClick = useCallback(
    (item) => {
      if (!item.isChecked) {
        // Before marking on cart, open modal for pricing per pcs
        setPricingModalItem(item)
      } else {
        // Unchecking back to 'To Buy'
        actions.toggleItem({ id: item.id })
      }
    },
    [actions]
  )

  const handleConfirmPrice = useCallback(
    ({ id, price, quantity }) => {
      actions.updatePrice({ id, price })
      if (quantity !== undefined && pricingModalItem) {
        const delta = quantity - (pricingModalItem.quantity || 1)
        if (delta !== 0) {
          actions.updateQuantity({ id, delta })
        }
      }
      actions.toggleItem({ id })
      setPricingModalItem(null)
    },
    [actions, pricingModalItem]
  )

  const handleRemove = useCallback((id) => actions.removeItem({ id }), [actions])
  const handleRename = useCallback((id, newName) => actions.renameItem({ id, newName }), [actions])
  const handleUpdateQuantity = useCallback((id, delta) => actions.updateQuantity({ id, delta }), [actions])
  const handleUpdatePrice = useCallback((id, price) => actions.updatePrice({ id, price }), [actions])

  const handleGenerateReceipt = useCallback(() => setIsReceiptModalOpen(true), [])

  return (
    <div className="px-4 pb-56 overflow-x-hidden">
      {/* 1. Shopping Progress Bar full-length container without border (Wireframe Layout: input_file_3.png) */}
      {items.length > 0 && (
        <div className="mt-4 w-full">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-warm-gray mb-2">
            <ShoppingBag className="h-4 w-4 text-green" />
            <span>Shopping Progress</span>
          </div>
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold text-warm-dark">
            <span className="font-mono text-xs text-warm-dark">
              {checkedItems.length}/{items.length} items on cart
            </span>
            <span className="rounded-full bg-green/15 text-green font-mono font-black px-2 py-0.5 text-[11px]">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-border/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* 2. Add Item & Sort Controls Row right below Shopping Progress on the right (input_file_0.png) */}
      <div className="mt-4 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-xl bg-green px-4 h-10 text-xs font-bold text-white transition-all hover:bg-green-light active:scale-[0.98] flex items-center gap-1.5 shadow-none"
        >
          <Plus className="h-4 w-4 stroke-2" />
          <span>Add Item</span>
        </button>
        {items.length > 1 && (
          <SortControls sortOrder={sortOrder} onSortChange={setSortOrder} />
        )}
      </div>

      {/* Main List Section */}
      <div className="mt-5">
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
                <div className="mb-2.5 flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase tracking-widest text-warm-gray">
                    To Buy ({uncheckedItems.length})
                  </h2>
                  <button
                    type="button"
                    onClick={actions.clearUnchecked}
                    className="text-xs font-bold text-warm-gray hover:text-danger transition-colors flex items-center gap-1.5"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Clear to buy</span>
                  </button>
                </div>
                <div className="divide-y divide-border/50">
                  <AnimatePresence>
                    {uncheckedItems.map((item) => (
                      <GroceryItemRow
                        key={item.id}
                        item={item}
                        onToggle={handleToggleClick}
                        onRemove={handleRemove}
                        onRename={handleRename}
                        onUpdateQuantity={handleUpdateQuantity}
                        onUpdatePrice={handleUpdatePrice}
                      />
                    ))}
                  </AnimatePresence>
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
                  <AnimatePresence>
                    {checkedItems.map((item) => (
                      <GroceryItemRow
                        key={item.id}
                        item={item}
                        onToggle={handleToggleClick}
                        onRemove={handleRemove}
                        onRename={handleRename}
                        onUpdateQuantity={handleUpdateQuantity}
                        onUpdatePrice={handleUpdatePrice}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Cart Drawer docked right above BottomNav */}
      <BottomCartDrawer
        checkedItems={checkedItems}
        onCartTotal={onCartTotal}
        onGenerateReceipt={handleGenerateReceipt}
      />

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
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
