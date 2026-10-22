import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Upload, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CatalogDataMenu({ onImport, onExport, canExport = true }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function handleSelect(action) {
    setIsOpen(false)
    action()
  }

  const options = [
    { label: 'Import from CSV', icon: Upload, onClick: onImport, disabled: false },
    { label: 'Export to CSV', icon: Download, onClick: onExport, disabled: !canExport },
  ]

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-7 w-7 items-center justify-center rounded-lg text-warm-gray hover:bg-cream-dark hover:text-warm-dark transition-colors ${
          isOpen ? 'bg-cream-dark text-warm-dark' : ''
        }`}
        aria-label="Import or export catalog"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title="Import / Export"
      >
        <MoreHorizontal className="h-4 w-4 stroke-[2.5]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-1.5 w-48 origin-top-right rounded-2xl bg-surface border border-border/80 p-1.5 shadow-lg z-50 normal-case tracking-normal"
          >
            {options.map((opt) => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.label}
                  type="button"
                  role="menuitem"
                  disabled={opt.disabled}
                  onClick={() => handleSelect(opt.onClick)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-warm-dark hover:bg-cream/80 hover:text-green transition-all text-left disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Icon className="h-3.5 w-3.5 stroke-[2.25]" />
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
