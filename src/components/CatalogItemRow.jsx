import { memo } from 'react'
import { Check, Pencil } from 'lucide-react'
import { motion } from 'framer-motion'

const CatalogItemRow = memo(function CatalogItemRow({
  item,
  isSelected,
  isOnList,
  onToggle,
  onEdit,
  onRemove,
}) {
  const { id, name, defaultPrice = 0 } = item

  const isLongName = name.length > 24
  const isVeryLongName = name.length > 40
  const nameSizeClass = isVeryLongName
    ? 'text-xs sm:text-sm font-semibold leading-tight'
    : isLongName
    ? 'text-sm font-semibold leading-snug'
    : 'text-base font-semibold'

  const formattedPrice = defaultPrice.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`group border-b last:border-b-0 py-3.5 px-4 sm:px-6 -mx-4 sm:mx-0 transition-colors shadow-none flex items-start gap-3.5 sm:gap-4 ${
        isSelected
          ? 'bg-[#eef8f3] border-border/40'
          : 'border-border/40 bg-surface hover:bg-cream/30'
      }`}
    >
      {/* Left: Selection Checkbox */}
      <button
        type="button"
        role="checkbox"
        aria-checked={isSelected}
        aria-label={`Select ${name}`}
        onClick={() => onToggle(id)}
        className="pt-1 shrink-0 cursor-pointer"
      >
        <div
          className={`flex h-5 w-5 sm:h-[22px] sm:w-[22px] items-center justify-center rounded-[4px] border transition-all ${
            isSelected
              ? 'border-green bg-green text-white shadow-sm'
              : 'border-warm-gray/40 bg-white hover:border-green hover:bg-green/5'
          }`}
        >
          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3] animate-check" />}
        </div>
      </button>

      {/* Right: Content Area */}
      <div className="flex-1 flex flex-col min-w-0 gap-1">
        {/* Top Row: Name, Badge, Edit and Remove */}
        <div className="flex items-start justify-between gap-3 w-full">
          <div className="flex-1 min-w-0 flex items-start gap-2 pt-0.5">
            <span
              onClick={() => onToggle(id)}
              className={`flex-1 min-w-0 break-words cursor-pointer select-none text-warm-dark ${nameSizeClass}`}
            >
              {name}
            </span>
            {isOnList && (
              <span className="shrink-0 mt-0.5 rounded-full bg-green/15 text-green text-[10px] font-black uppercase tracking-wider px-2 py-0.5">
                On list
              </span>
            )}
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="shrink-0 p-1 text-warm-gray hover:text-warm-dark rounded-md hover:bg-cream transition-colors opacity-70 hover:opacity-100"
              aria-label="Edit staple"
            >
              <Pencil className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item)}
            className="shrink-0 text-[11px] sm:text-xs font-semibold text-warm-gray hover:text-danger pt-0.5 transition-colors"
          >
            Remove
          </button>
        </div>

        {/* Bottom Row: Default Price */}
        <div onClick={() => onToggle(id)} className="cursor-pointer select-none">
          {defaultPrice > 0 ? (
            <span className="text-sm font-mono font-black text-warm-dark">
              ₱{formattedPrice}
              <span className="ml-1 font-sans text-xs font-semibold text-warm-gray">/ pc</span>
            </span>
          ) : (
            <span className="text-xs font-medium text-warm-muted">No default price</span>
          )}
        </div>
      </div>
    </motion.div>
  )
})

export default CatalogItemRow
