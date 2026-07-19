import { useState, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, Receipt, CheckCircle2 } from 'lucide-react'

const BottomCartDrawer = memo(function BottomCartDrawer({ checkedItems = [], onCartTotal = 0, onGenerateReceipt }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY
      const innerHeight = window.innerHeight
      const scrollHeight = document.documentElement.scrollHeight

      // Check if user scrolled to the bottom end (within 50px of bottom)
      const isAtBottom = innerHeight + scrollY >= scrollHeight - 50

      if (isAtBottom && scrollY > lastScrollY.current && scrollHeight > innerHeight + 100) {
        setIsDrawerOpen(true)
      } else if (!isAtBottom && lastScrollY.current - scrollY > 15) {
        // If scrolled up significantly away from bottom, close drawer
        setIsDrawerOpen(false)
      }

      lastScrollY.current = scrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!checkedItems || checkedItems.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-35 sm:max-w-2xl sm:mx-auto bg-surface border-t border-border/80 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] transition-all">
      {/* 1. Upper block above the summary bar separated specifically for the chevron toggle button */}
      <div className="flex justify-center -translate-y-full absolute top-0 left-0 right-0 pointer-events-none z-10">
        <button
          type="button"
          onClick={() => setIsDrawerOpen((prev) => !prev)}
          className="pointer-events-auto flex items-center justify-center h-7 px-8 rounded-t-2xl bg-surface border-t border-x border-border/80 text-warm-dark hover:bg-cream transition-all shadow-[0_-4px_12px_rgba(0,0,0,0.05)] active:scale-95"
          aria-label="Toggle cart drawer"
          title={isDrawerOpen ? 'Collapse cart total drawer' : 'Expand cart total drawer'}
        >
          {isDrawerOpen ? (
            <ChevronDown className="h-4 w-4 stroke-[2.5]" />
          ) : (
            <ChevronUp className="h-4 w-4 stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* 2. Compact summary bar (when closed, sleek sizing without bulky button wedged inside) */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 className="h-4 w-4 text-green shrink-0 stroke-[2.5]" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-warm-dark truncate">
            On Cart Total:
          </span>
        </div>

        {/* Total Price display */}
        <div className="text-right shrink-0">
          <span className="text-base sm:text-lg font-black font-mono text-green tabular-nums">
            ₱{onCartTotal.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {/* 3. Expandable Drawer Content (Generate Receipt Button with generous padding above tab bar) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-border/50 bg-cream/70 px-6 pt-3.5 pb-5"
          >
            <button
              type="button"
              onClick={onGenerateReceipt}
              className="w-full rounded-xl bg-green px-5 py-3.5 text-xs sm:text-sm font-black text-white hover:bg-green-light transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xs"
            >
              <Receipt className="h-4 w-4 stroke-[2.5]" />
              <span>Generate Receipt</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export default BottomCartDrawer
