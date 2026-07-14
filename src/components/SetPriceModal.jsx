import { useState, useEffect, useRef } from 'react'
import { Tag, X, Check } from 'lucide-react'

export default function SetPriceModal({ item, isOpen, onClose, onConfirm }) {
  const [price, setPrice] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && item) {
      setPrice(item.price ? String(item.price) : '')
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
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !item) return null

  const qty = item.quantity || 1
  const numericPrice = parseFloat(price) || 0
  const itemTotal = numericPrice * qty

  function handleSubmit(e) {
    e.preventDefault()
    onConfirm({ id: item.id, price: numericPrice })
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green/10 text-green">
              <Tag className="h-5 w-5 stroke-[2.25]" />
            </div>
            <div>
              <h2 id="price-modal-title" className="text-base font-black text-warm-dark leading-tight">
                Item Price per Pcs
              </h2>
              <p className="text-xs font-medium text-warm-gray mt-0.5">
                Before marking on cart
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-warm-gray hover:bg-cream hover:text-warm-dark transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="rounded-xl bg-cream border border-border/60 p-3.5">
            <div className="text-xs font-bold uppercase tracking-wider text-warm-gray">
              Item to mark on cart
            </div>
            <div className="mt-1 flex items-center justify-between text-sm font-black text-warm-dark break-words">
              <span>{item.name}</span>
              <span className="font-mono text-xs text-green bg-green/10 px-2 py-0.5 rounded-md shrink-0 ml-2">
                Qty: {qty} pcs
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-warm-gray mb-2">
              Price per piece (₱ / pcs)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-warm-gray">
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
                className="w-full rounded-xl bg-surface border-2 border-border/80 pl-9 pr-4 py-3 text-base font-mono font-black text-warm-dark placeholder:text-warm-muted transition-colors focus:border-green focus:outline-none shadow-none"
              />
            </div>
          </div>

          <div className="rounded-xl bg-[#eef8f3] border border-[#aadcbe] p-3.5 flex items-center justify-between text-xs sm:text-sm font-black">
            <span className="text-warm-dark">Computed Item Total:</span>
            <span className="font-mono text-green text-base">
              ₱
              {itemTotal.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="mt-6 pt-4 border-t border-border/50 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl border border-border/80 bg-transparent px-5 py-2.5 text-xs font-bold text-warm-dark hover:bg-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-xl bg-green px-6 py-2.5 text-xs font-bold text-white hover:bg-green-light active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-none"
            >
              <Check className="h-4 w-4 stroke-3 animate-check" />
              <span>Mark on Cart</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
