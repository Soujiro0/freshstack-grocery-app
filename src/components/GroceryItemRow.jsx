import { useState, useEffect, memo } from 'react'
import { Check, Plus, Minus, Pencil, X } from 'lucide-react'
import { motion } from 'framer-motion'
import ConfirmDeleteModal from './ConfirmDeleteModal'

const GroceryItemRow = memo(function GroceryItemRow({
  item,
  onToggle,
  onRemove,
  onUpdateQuantity,
  onUpdatePrice,
  onRename,
}) {
  const { id, name, isChecked, quantity = 1, price = 0 } = item
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [editPrice, setEditPrice] = useState(price)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Quantity edit state
  const [isEditingQuantity, setIsEditingQuantity] = useState(false)
  const [editQuantity, setEditQuantity] = useState(quantity)

  // Sync state if prop changes while editing
  useEffect(() => {
    if (!isEditing) {
      setEditName(name)
      setEditPrice(price)
    }
  }, [name, price, isEditing])

  useEffect(() => {
    if (!isEditingQuantity) {
      setEditQuantity(quantity)
    }
  }, [quantity, isEditingQuantity])

  const isLongName = name.length > 24
  const isVeryLongName = name.length > 40
  const nameSizeClass = isVeryLongName
    ? 'text-xs sm:text-sm font-semibold leading-tight'
    : isLongName
    ? 'text-sm font-semibold leading-snug'
    : 'text-base font-semibold'

  const itemTotal = (price || 0) * (quantity || 1)
  const formattedItemTotal = itemTotal.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  function handleSaveRename() {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== name && onRename) {
      onRename(id, trimmed)
    } else {
      setEditName(name)
    }

    if (isChecked && onUpdatePrice) {
      const parsedPrice = parseFloat(editPrice)
      if (!isNaN(parsedPrice) && parsedPrice !== price) {
        onUpdatePrice(id, Math.max(0, parsedPrice))
      }
    }
    
    setIsEditing(false)
  }

  function handleSaveQuantity() {
    setIsEditingQuantity(false)
    const parsed = parseInt(editQuantity, 10)
    if (!isNaN(parsed) && parsed > 0 && parsed !== quantity) {
      const delta = parsed - quantity
      if (onUpdateQuantity) onUpdateQuantity(id, delta)
    } else {
      setEditQuantity(quantity)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`group border-b last:border-b-0 py-3.5 px-4 sm:px-6 -mx-6 sm:mx-0 transition-colors shadow-none flex items-start gap-3.5 sm:gap-4 ${
        isChecked
          ? 'bg-[#eef8f3] border-border/40'
          : 'border-border/40 bg-surface hover:bg-cream/30'
      }`}
    >
      {/* Left: Checkbox */}
      {!isEditing && (
        <div 
          className="pt-1 cursor-pointer shrink-0"
          onClick={() => onToggle(item)}
        >
          <div
            className={`flex h-5 w-5 sm:h-[22px] sm:w-[22px] items-center justify-center rounded-[4px] border transition-all ${
              isChecked
                ? 'border-green bg-green text-white shadow-sm'
                : 'border-warm-gray/40 bg-white hover:border-green hover:bg-green/5'
            }`}
          >
            {isChecked && <Check className="h-3.5 w-3.5 stroke-[3] animate-check" />}
          </div>
        </div>
      )}

      {/* Right: Content Area */}
      <div className="flex-1 flex flex-col min-w-0 gap-2.5">
        
        {/* Top Row: Name and Remove */}
        <div className="flex items-start justify-between gap-3 w-full">
          <div className="flex-1 min-w-0 flex items-start gap-2 pt-0.5">
            {isEditing ? (
              <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename()
                    if (e.key === 'Escape') {
                      setEditName(name)
                      setEditPrice(price)
                      setIsEditing(false)
                    }
                  }}
                  autoFocus
                  className="flex-1 min-w-0 rounded bg-white border border-green px-2 py-1 text-sm sm:text-base font-bold text-warm-dark focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20 shadow-inner"
                  placeholder="Item name"
                />
                <button
                  type="button"
                  onClick={handleSaveRename}
                  className="shrink-0 p-1 text-green hover:bg-green/10 rounded-md transition-colors"
                  aria-label="Save"
                >
                  <Check className="h-[18px] w-[18px] stroke-[3]" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditName(name)
                    setEditPrice(price)
                    setIsEditing(false)
                  }}
                  className="shrink-0 p-1 text-warm-dark hover:bg-warm-gray/10 rounded-md transition-colors"
                  aria-label="Cancel"
                >
                  <X className="h-[18px] w-[18px] stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <>
                <span
                  onClick={() => onToggle(item)}
                  className={`flex-1 min-w-0 break-words cursor-pointer ${nameSizeClass} ${
                    isChecked ? 'line-through text-warm-gray opacity-70' : 'text-warm-dark'
                  }`}
                >
                  {name}
                </span>
                {onRename && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditName(name)
                      setEditPrice(price)
                      setIsEditing(true)
                    }}
                    className="shrink-0 p-1 text-warm-gray hover:text-warm-dark rounded-md hover:bg-cream transition-colors opacity-70 hover:opacity-100"
                    aria-label="Edit item"
                  >
                    <Pencil className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                )}
              </>
            )}
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsDeleteModalOpen(true)
              }}
              className="shrink-0 text-[11px] sm:text-xs font-semibold text-warm-gray hover:text-danger pt-0.5 transition-colors"
            >
              Remove
            </button>
          )}
        </div>

        {/* Bottom Row: Price & Quantity */}
        <div className="flex items-end justify-between gap-3 w-full min-h-[28px]">
          {/* Price Area */}
          <div className="flex-1 min-w-0 max-w-[150px]">
            {isChecked ? (
              isEditing ? (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-warm-dark">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editPrice === 0 ? '' : editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename()
                      if (e.key === 'Escape') {
                        setEditName(name)
                        setEditPrice(price)
                        setIsEditing(false)
                      }
                    }}
                    className="w-full rounded bg-white border border-warm-gray/40 pl-6 pr-2 py-1 text-sm font-mono font-bold text-warm-dark focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20 shadow-inner"
                    placeholder="0.00"
                  />
                </div>
              ) : (
                <span 
                  className="text-sm font-mono font-black text-warm-dark truncate cursor-pointer block"
                  onClick={() => onToggle(item)}
                >
                  ₱{formattedItemTotal}
                </span>
              )
            ) : (
              <div className="w-full"></div>
            )}
          </div>

          {/* Quantity Stepper directly on card */}
          {!isEditing && (
            <div 
              className="flex items-center gap-1.5 rounded-md bg-warm-gray/15 p-1 shrink-0 ml-auto shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] border border-warm-gray/10 transition-all"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (onUpdateQuantity) onUpdateQuantity(id, -1)
                }}
                className="h-[22px] w-[22px] rounded-full flex items-center justify-center bg-transparent text-warm-dark hover:bg-white hover:shadow-sm active:scale-95 transition-all"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
              
              {isEditingQuantity ? (
                <input
                  type="number"
                  min="1"
                  autoFocus
                  value={editQuantity === 0 ? '' : editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  onBlur={handleSaveQuantity}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveQuantity()
                    if (e.key === 'Escape') {
                      setEditQuantity(quantity)
                      setIsEditingQuantity(false)
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-10 text-center rounded bg-white border border-green py-0.5 text-xs font-bold text-warm-dark focus:outline-none focus:ring-2 focus:ring-green/20"
                />
              ) : (
                <span 
                  className="w-6 text-center text-xs font-bold text-warm-dark tabular-nums cursor-text hover:text-green"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditQuantity(quantity)
                    setIsEditingQuantity(true)
                  }}
                  title="Edit Quantity"
                >
                  {quantity}
                </span>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (onUpdateQuantity) onUpdateQuantity(id, 1)
                }}
                className="h-[22px] w-[22px] rounded-full flex items-center justify-center bg-transparent text-warm-dark hover:bg-white hover:shadow-sm active:scale-95 transition-all"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>

      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          setIsDeleteModalOpen(false)
          onRemove(id)
        }}
        itemName={name}
      />
    </motion.div>
  )
})

export default GroceryItemRow
