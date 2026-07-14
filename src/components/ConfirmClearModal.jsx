import { useEffect } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'

export default function ConfirmClearModal({ isOpen, onClose, onConfirm }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
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
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-danger/10 text-danger">
            <AlertTriangle className="h-6 w-6 stroke-2.5" />
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

        <div className="mt-4">
          <h2 id="clear-modal-title" className="text-lg font-black text-warm-dark">
            Clear Entire List?
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-warm-gray">
            Are you sure you want to remove all items from your checklist? This action cannot be undone.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl border border-border/80 bg-transparent px-5 py-2.5 text-xs font-bold text-warm-dark hover:bg-cream transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="w-full sm:w-auto rounded-xl bg-danger px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Trash2 className="h-4 w-4 stroke-2" />
            <span>Yes, Clear List</span>
          </button>
        </div>
      </div>
    </div>
  )
}
