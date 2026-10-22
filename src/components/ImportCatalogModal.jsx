import { useEffect } from 'react'
import { FileUp, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

/**
 * Confirms a catalog CSV import.
 * `preview` = { fileName, added, updated, unchanged, skipped }
 */
export default function ImportCatalogModal({ preview, onConfirm, onClose }) {
  const isOpen = Boolean(preview)
  const hasChanges = Boolean(preview && (preview.added > 0 || preview.updated > 0))

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-catalog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-sm bg-surface rounded-3xl p-6 sm:p-7 shadow-2xl border border-border/80 relative"
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
              <div className="h-14 w-14 rounded-2xl bg-green/10 text-green flex items-center justify-center mb-4 border border-green/20">
                <FileUp className="h-7 w-7 stroke-[2.25]" />
              </div>

              <h3 id="import-catalog-title" className="text-lg sm:text-xl font-black text-warm-dark leading-tight">
                {hasChanges ? 'Import staples?' : 'Nothing to import'}
              </h3>
              <p className="text-xs font-medium text-warm-gray mt-1.5 break-all">{preview.fileName}</p>

              <ul className="w-full mt-5 divide-y divide-border/50 rounded-2xl border border-border/70 text-left text-sm">
                <li className="flex items-center justify-between px-4 py-2.5">
                  <span className="font-semibold text-warm-dark">New staples</span>
                  <span className="font-mono font-black text-green">{preview.added}</span>
                </li>
                <li className="flex items-center justify-between px-4 py-2.5">
                  <span className="font-semibold text-warm-dark">Price updates</span>
                  <span className="font-mono font-black text-warm-dark">{preview.updated}</span>
                </li>
                <li className="flex items-center justify-between px-4 py-2.5">
                  <span className="font-semibold text-warm-gray">Already up to date</span>
                  <span className="font-mono font-bold text-warm-gray">{preview.unchanged}</span>
                </li>
                {preview.skipped > 0 && (
                  <li className="flex items-center justify-between px-4 py-2.5">
                    <span className="font-semibold text-amber-dark">Skipped rows</span>
                    <span className="font-mono font-bold text-amber-dark">{preview.skipped}</span>
                  </li>
                )}
              </ul>

              <p className="text-[11px] font-medium text-warm-gray mt-3 leading-relaxed">
                {hasChanges
                  ? 'Existing staples are kept. Matching names get the price from the file.'
                  : preview.skipped > 0
                  ? `${plural(preview.skipped, 'row')} had no name or an invalid price. Use the columns name, defaultPrice.`
                  : 'Every staple in this file is already in your catalog.'}
              </p>

              <div className="w-full mt-6 space-y-2.5">
                {hasChanges && (
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="w-full rounded-2xl bg-green hover:bg-green-light active:scale-[0.98] text-white py-3.5 text-sm font-black tracking-tight transition-all"
                  >
                    Import Staples
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-2xl bg-cream hover:bg-cream-dark active:scale-[0.98] text-warm-dark border border-border/80 py-3.5 text-sm font-black tracking-tight transition-all"
                >
                  {hasChanges ? 'Cancel' : 'Close'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
