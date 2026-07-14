import { useState } from 'react'
import { Check, Trash2, ChevronDown, Plus, Minus } from 'lucide-react'

export default function GroceryItemRow({
  item,
  onToggle,
  onRemove,
  onUpdateQuantity,
  onUpdatePrice,
}) {
  const { id, name, isChecked, quantity = 1, price = 0 } = item
  const [isOpen, setIsOpen] = useState(false)

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

  return (
    <div
      className={`group border-y py-4 px-6 -mx-6 transition-colors shadow-none ${
        isChecked
          ? 'bg-[#eef8f3] border-[#aadcbe]'
          : 'border-border/60 bg-surface hover:bg-cream/20'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <label
          className="flex items-center gap-3.5 cursor-pointer flex-1 select-none min-w-0"
          onClick={() => onToggle(id)}
        >
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
              isChecked
                ? 'border-green bg-green text-white'
                : 'border-border bg-transparent hover:border-green'
            }`}
          >
            {isChecked && <Check className="h-3.5 w-3.5 stroke-3 animate-check" />}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span
              className={`break-words transition-all ${nameSizeClass} ${
                isChecked ? 'line-through text-warm-gray opacity-60' : 'text-warm-dark'
              }`}
            >
              {name}
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono text-warm-gray">
              <span className="font-bold text-warm-dark">Qty: {quantity}</span>
              {isChecked && (
                <>
                  <span>•</span>
                  <span className="font-bold text-green">Total: ₱{formattedItemTotal}</span>
                </>
              )}
            </div>
          </div>
        </label>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(!isOpen)
            }}
            className="h-8 w-8 flex items-center justify-center text-warm-gray hover:text-warm-dark rounded-lg hover:bg-cream transition-colors"
            aria-label={isOpen ? 'Hide quantity controls' : 'Show quantity controls'}
            title="Adjust quantity"
          >
            <ChevronDown
              className={`h-4 w-4 stroke-2 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => onRemove(id)}
            className="h-8 w-8 flex items-center justify-center text-warm-muted hover:text-danger rounded-lg hover:bg-red-50/50 transition-colors opacity-70 group-hover:opacity-100"
            aria-label="Remove item"
            title="Remove item"
          >
            <Trash2 className="h-4 w-4 stroke-2" />
          </button>
        </div>
      </div>

      {/* Dropdown containing Price Input (if on cart) & Quantity Stepper */}
      {isOpen && (
        <div
          className="mt-3.5 pt-3.5 border-t border-border/50 flex flex-col gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {isChecked && (
            <div className="flex items-center justify-between gap-4">
              <label className="text-xs font-bold text-warm-gray whitespace-nowrap">
                Price / qty (₱):
              </label>
              <div className="relative w-32 shrink-0">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-warm-gray">
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    if (onUpdatePrice) {
                      onUpdatePrice(isNaN(val) ? 0 : Math.max(0, val))
                    }
                  }}
                  className="w-full rounded-lg bg-surface border border-border/80 pl-6 pr-2 py-1.5 text-xs font-mono font-bold text-warm-dark focus:border-green focus:outline-none shadow-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-bold text-warm-gray uppercase tracking-wider whitespace-nowrap">
              Quantity:
            </label>
            <div className="flex items-center gap-2 rounded-lg bg-cream border border-border/80 p-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (onUpdateQuantity) onUpdateQuantity(-1)
                }}
                className="h-7 w-7 rounded flex items-center justify-center bg-surface border border-border/60 text-warm-dark hover:bg-cream-dark active:scale-95 font-bold shadow-none"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5 stroke-2" />
              </button>
              <span className="w-8 text-center text-xs font-mono font-bold text-warm-dark tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (onUpdateQuantity) onUpdateQuantity(1)
                }}
                className="h-7 w-7 rounded flex items-center justify-center bg-surface border border-border/60 text-warm-dark hover:bg-cream-dark active:scale-95 font-bold shadow-none"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5 stroke-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
