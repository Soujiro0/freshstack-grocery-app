import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const CatalogSelectionBar = memo(function CatalogSelectionBar({ selectedCount = 0, onAdd }) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-16 left-0 right-0 z-35 sm:max-w-2xl sm:mx-auto bg-surface border-t border-border/80 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]"
        >
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="h-4 w-4 text-green shrink-0 stroke-[2.5]" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-warm-dark truncate">
                {selectedCount === 1 ? '1 staple selected' : `${selectedCount} staples selected`}
              </span>
            </div>

            <button
              type="button"
              onClick={onAdd}
              className="rounded-xl bg-green px-4 h-10 text-xs font-bold text-white transition-all hover:bg-green-light active:scale-[0.98] flex items-center gap-1.5 shadow-none shrink-0"
            >
              <span>Add to List</span>
              <ArrowRight className="h-4 w-4 stroke-2" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

export default CatalogSelectionBar
