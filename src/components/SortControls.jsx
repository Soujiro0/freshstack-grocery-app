import { useState, useRef, useEffect } from 'react'
import { ArrowDownAZ, ArrowUpZA, Sparkles, ArrowUpDown, ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SortControls({ sortOrder = 'default', onSortChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const options = [
    { value: 'default', label: 'Default Order', icon: Sparkles },
    { value: 'asc', label: 'Name A → Z', icon: ArrowDownAZ },
    { value: 'desc', label: 'Name Z → A', icon: ArrowUpZA },
  ]

  const currentOption = options.find((opt) => opt.value === sortOrder) || options[0]

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside)
    }
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  function handleOptionClick(value) {
    onSortChange(value)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger Button (Compact square button matching wireframe next to Add Item) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-center rounded-xl bg-surface border border-border/80 text-warm-dark hover:bg-cream-dark active:scale-95 transition-all shadow-none ${
          isOpen ? 'border-green ring-2 ring-green/20' : ''
        } h-10 px-3 gap-1.5`}
        aria-label="Sort options"
        title={`Current Sort: ${currentOption.label}`}
      >
        <ArrowUpDown className="h-4 w-4 text-green stroke-[2.25]" />
        <span className="text-xs font-bold sm:inline hidden">{currentOption.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-warm-gray transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-1.5 w-48 origin-top-right rounded-2xl bg-surface border border-border/80 p-1.5 shadow-lg z-50 divide-y divide-border/40"
          >
            <div className="py-1 space-y-0.5">
              {options.map((opt) => {
                const Icon = opt.icon
                const isActive = sortOrder === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleOptionClick(opt.value)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                      isActive
                        ? 'bg-green/15 text-green'
                        : 'text-warm-dark hover:bg-cream/80 hover:text-green'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 stroke-[2.25]" />
                      <span>{opt.label}</span>
                    </div>
                    {isActive && <Check className="h-3.5 w-3.5 text-green stroke-[2.5]" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
