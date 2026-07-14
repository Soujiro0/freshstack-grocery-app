import { useState, useEffect, useRef } from 'react'
import { PlusCircle, X } from 'lucide-react'

export default function AddCatalogItemModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('')
  const [defaultPrice, setDefaultPrice] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setDefaultPrice('')
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
  }, [isOpen])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    onAdd({
      name: trimmed,
      defaultPrice: parseFloat(defaultPrice) || 0,
    })
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-catalog-title"
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
              <PlusCircle className="h-5 w-5 stroke-[2.25]" />
            </div>
            <div>
              <h2 id="add-catalog-title" className="text-lg font-black text-warm-dark leading-tight">
                Add Catalog Staple
              </h2>
              <p className="text-xs font-medium text-warm-gray mt-0.5">
                Save an everyday staple for instant batch adding
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
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-warm-gray mb-2">
              Staple Item Name
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. Organic Bananas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-cream border border-border/80 px-4 py-3 text-sm font-semibold text-warm-dark placeholder:text-warm-muted transition-colors focus:border-green focus:outline-none shadow-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-warm-gray mb-2">
              Default Price per piece (₱) — Optional
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-warm-gray">
                ₱
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(e.target.value)}
                className="w-full rounded-xl bg-cream border border-border/80 pl-9 pr-4 py-3 text-sm font-mono font-semibold text-warm-dark placeholder:text-warm-muted transition-colors focus:border-green focus:outline-none shadow-none"
              />
            </div>
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
              disabled={!name.trim()}
              className="w-full sm:w-auto rounded-xl bg-green px-6 py-2.5 text-xs font-bold text-white hover:bg-green-light active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-none"
            >
              Save to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
