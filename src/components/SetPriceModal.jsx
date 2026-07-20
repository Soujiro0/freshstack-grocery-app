import { useState, useEffect, useRef } from 'react'
import { X, Check, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SetPriceModal({ item, isOpen, onClose, onConfirm }) {
  const [price, setPrice] = useState('')
  const [localQty, setLocalQty] = useState(1)
  
  // Local quantity edit state
  const [isEditingQty, setIsEditingQty] = useState(false)
  const [editQtyValue, setEditQtyValue] = useState(1)
  
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && item) {
      setPrice(item.price ? String(item.price) : '')
      setLocalQty(item.quantity || 1)
      setIsEditingQty(false)
      document.body.style.overflow = 'hidden'
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus()
      }, 50)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, item])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !isEditingQty) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, isEditingQty])

  const numericPrice = parseFloat(price) || 0
  const itemTotal = numericPrice * localQty

  function handleSubmit(e) {
    e.preventDefault()
    onConfirm({ id: item.id, price: numericPrice, quantity: localQty })
    onClose()
  }

  function handleUpdateQuantity(delta) {
    setLocalQty((prev) => Math.max(1, prev + delta))
  }

  function handleSaveQty() {
    setIsEditingQty(false)
    const parsed = parseInt(editQtyValue, 10)
    if (!isNaN(parsed) && parsed > 0) {
      setLocalQty(parsed)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && item && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-cream rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 pb-4">
              <div>
                <h2 className="text-lg font-black text-warm-dark tracking-tight">
                  Set price of item
                </h2>
                <p className="text-xs font-medium text-warm-gray mt-1">
                  Automatically calculated based on the quantity
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 bg-warm-gray/20 text-warm-dark hover:bg-warm-gray/30 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Item Name Banner (Darker Band) */}
            <div className="bg-[#eef8f3] px-6 py-3 border-y border-[#aadcbe]">
              <div className="text-sm font-black text-green break-words">
                {item.name}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
              
              {/* Price Input */}
              <div>
                <label className="block text-[11px] font-bold text-warm-dark mb-2">
                  Price per Quantity
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-warm-dark">
                    ₱
                  </span>
                  <input
                    ref={inputRef}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded bg-white border border-warm-gray/40 pl-9 pr-4 py-3 text-base font-mono font-black text-warm-dark focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20 shadow-inner"
                  />
                </div>
              </div>

              {/* Quantity Controls */}
              <div>
                <label className="block text-[11px] font-bold text-warm-dark mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded bg-warm-gray/20 p-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] border border-warm-gray/10 transition-all">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(-1)}
                      className="h-8 w-8 rounded-full flex items-center justify-center bg-white text-warm-dark hover:bg-cream active:scale-95 transition-all shadow-sm"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4 stroke-[2.5]" />
                    </button>
                    
                    {isEditingQty ? (
                      <input
                        type="number"
                        min="1"
                        autoFocus
                        value={editQtyValue === 0 ? '' : editQtyValue}
                        onChange={(e) => setEditQtyValue(e.target.value)}
                        onBlur={handleSaveQty}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSaveQty()
                          }
                          if (e.key === 'Escape') {
                            setIsEditingQty(false)
                          }
                        }}
                        className="w-16 text-center rounded bg-white border border-green py-1 text-sm font-bold text-warm-dark focus:outline-none focus:ring-2 focus:ring-green/20"
                      />
                    ) : (
                      <span 
                        className="w-10 text-center text-sm font-bold text-warm-dark tabular-nums cursor-text hover:text-green"
                        onClick={() => {
                          setEditQtyValue(localQty)
                          setIsEditingQty(true)
                        }}
                        title="Edit Quantity"
                      >
                        {localQty}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(1)}
                      className="h-8 w-8 rounded-full flex items-center justify-center bg-white text-warm-dark hover:bg-cream active:scale-95 transition-all shadow-sm"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Computed Total */}
              <div className="flex items-center justify-between text-sm pt-2">
                <span className="text-warm-dark font-medium">Computed Total:</span>
                <span className="font-mono font-black text-warm-dark">
                  ₱
                  {itemTotal.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-3 mt-4">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-green px-6 py-3.5 text-sm font-bold text-white hover:bg-green-light active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-none border border-transparent"
                >
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>Mark on Cart</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl bg-surface border border-border/80 px-6 py-3.5 text-sm font-bold text-warm-dark hover:bg-cream active:scale-[0.98] transition-all shadow-none"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
