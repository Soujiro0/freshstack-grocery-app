import { useState, useEffect, useRef } from 'react'
import { X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function EditCatalogItemDrawer({ item, isOpen, onClose, onConfirm }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && item) {
      setName(item.name || '')
      setPrice(item.defaultPrice ? String(item.defaultPrice) : '')
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

  const numericPrice = parseFloat(price) || 0

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onConfirm({ id: item.id, newName: trimmed, newPrice: numericPrice })
    onClose()
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
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320, bounce: 0 }}
            className="relative w-full max-w-md bg-cream rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 pb-4">
              <div>
                <h2 className="text-lg font-black text-warm-dark tracking-tight">
                  Edit Catalog Staple
                </h2>
                <p className="text-xs font-medium text-warm-gray mt-1">
                  Update staple name and default price
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-border/40 p-2 text-warm-dark hover:bg-border/60 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 pt-2 overflow-y-auto min-h-0">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-warm-dark mb-2">
                    Item Name
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-surface border border-green px-4 py-3 text-sm font-bold text-warm-dark focus:outline-none focus:ring-2 focus:ring-green/20"
                    placeholder="Staple name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-warm-dark mb-2">
                    Price per piece (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-warm-dark">
                      ₱
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-xl bg-surface border border-green pl-9 pr-4 py-3 text-sm font-bold text-warm-dark focus:outline-none focus:ring-2 focus:ring-green/20"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full rounded-xl bg-green px-4 py-3.5 text-sm font-black text-white hover:bg-green-light active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-[0_4px_12px_rgba(20,93,65,0.2)]"
                >
                  <Check className="h-5 w-5 stroke-[2.5]" />
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl bg-surface border border-border/80 px-4 py-3.5 text-sm font-bold text-warm-dark hover:bg-border/40 active:scale-[0.98] transition-all"
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
