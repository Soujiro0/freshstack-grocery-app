import { useEffect } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmClearModal({ isOpen, onClose, onConfirm }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose()
      if (e.key === 'Enter' && isOpen) {
        onConfirm()
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, onConfirm])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
            className="w-full max-w-sm rounded-3xl border border-border/80 bg-surface p-6 sm:p-7 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 h-8 w-8 rounded-full bg-cream/80 text-warm-gray hover:text-warm-dark flex items-center justify-center transition-colors shadow-none"
              aria-label="Close modal"
            >
              <X className="h-4 w-4 stroke-[2.5]" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-danger-muted text-danger flex items-center justify-center mb-4.5 shadow-2xs border border-danger/20">
                <AlertTriangle className="h-7 w-7 stroke-[2.25]" />
              </div>

              <h2 id="clear-modal-title" className="text-lg sm:text-xl font-black text-warm-dark leading-tight">
                Clear Entire List?
              </h2>

              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-warm-gray max-w-xs">
                Remove all items from your checklist?
              </p>

              <div className="w-full mt-6 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className="w-full rounded-2xl bg-danger hover:bg-danger/90 active:scale-[0.98] text-white py-3.5 text-sm font-black tracking-tight shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4 stroke-2" />
                  <span>Yes, Clear List</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-2xl bg-cream hover:bg-cream-dark active:scale-98 text-warm-dark border border-border/80 py-3.5 text-sm font-black tracking-tight transition-all flex items-center justify-center"
                >
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
