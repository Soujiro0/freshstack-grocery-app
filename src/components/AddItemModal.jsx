import { useState, useEffect, useMemo, useRef } from 'react'
import { PlusCircle, X, BookOpen, Check, Search, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGrocery } from '../store/GroceryContext'
import AddCatalogItemModal from './AddCatalogItemModal'

// Snap-point heights
const SHEET_HALF = '52svh'
const SHEET_FULL = '92svh'

// Shared spring config
const SPRING = { type: 'spring', damping: 32, stiffness: 320, bounce: 0 }

export default function AddItemModal({ isOpen, onClose }) {
  const { state, actions } = useGrocery()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [isAddCatalogOpen, setIsAddCatalogOpen] = useState(false)
  const [lastAddedSentinel, setLastAddedSentinel] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  // Track mobile breakpoint for sheet vs centred-modal behavior
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : true,
  )
  const pointerStartY = useRef(null)

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 640)
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const catalogItems = state.catalog || []

  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return state.catalog || []
    const q = searchQuery.toLowerCase().trim()
    return (state.catalog || []).filter((item) => item.name.toLowerCase().includes(q))
  }, [state.catalog, searchQuery])

  // Reset every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setSelectedIds(new Set())
      setLastAddedSentinel(null)
      setIsExpanded(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Escape key – doesn't close when inner modal is open
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !isAddCatalogOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, isAddCatalogOpen])

  // Auto-select newly added catalog item
  useEffect(() => {
    if (!lastAddedSentinel) return
    const catalog = state.catalog || []
    if (catalog.length > lastAddedSentinel.prevLength) {
      const newItem = catalog
        .slice()
        .reverse()
        .find((i) => i.name === lastAddedSentinel.name)
      if (newItem) {
        setSelectedIds((prev) => new Set([...prev, newItem.id]))
        setLastAddedSentinel(null)
      }
    }
  }, [state.catalog, lastAddedSentinel])

  // ── Handlers ───────────────────────────────────────────────────

  function handleToggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleBatchAdd() {
    if (selectedIds.size === 0) return
    const itemsToAdd = catalogItems
      .filter((item) => selectedIds.has(item.id))
      .map((item) => ({
        name: item.name,
        quantity: 1,
        price: item.defaultPrice || 0,
        catalogId: item.id,
      }))
    actions.batchAddToList({ items: itemsToAdd })
    onClose()
  }

  function handleCatalogItemAdded(newItem) {
    const prevLength = (state.catalog || []).length
    actions.addToCatalog(newItem)
    setLastAddedSentinel({ prevLength, name: newItem.name.trim() })
  }

  // Drag gesture on the handle pill
  function handleHandlePointerDown(e) {
    pointerStartY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handleHandlePointerUp(e) {
    if (pointerStartY.current === null) return
    const dy = pointerStartY.current - e.clientY // positive = dragged up
    pointerStartY.current = null

    if (!isExpanded && dy > 30) {
      setIsExpanded(true)
    } else if (isExpanded && dy < -40) {
      setIsExpanded(false)
    } else if (!isExpanded && dy < -60) {
      onClose()
    }
  }

  // First scroll inside the list → expand to full (mobile only)
  function handleListScroll(e) {
    if (isMobile && !isExpanded && e.currentTarget.scrollTop > 0) {
      setIsExpanded(true)
    }
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      {/*
       * AnimatePresence lets framer-motion play exit animations before
       * unmounting. Without it, `if (!isOpen) return null` kills the
       * component instantly with no leave transition.
       */}
      <AnimatePresence>
        {isOpen && (
          // Outer: fades the whole overlay in/out
          <motion.div
            key="add-item-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 z-50"
          >
            {/* Scrim backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              onClick={!isAddCatalogOpen ? onClose : undefined}
            />

            {/* Flex container that positions the sheet at the bottom (or centre on desktop) */}
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-modal-title"
              className="absolute inset-0 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none"
            >
              {/*
               * The sheet itself.
               * Mobile  → slides up from off-screen (y: 100% → 0) and snaps
               *           between SHEET_HALF / SHEET_FULL heights.
               * Desktop → simple scale + fade, no height shenanigans.
               */}
              <motion.div
                initial={
                  isMobile
                    ? { y: '100%', height: SHEET_HALF }
                    : { opacity: 0, scale: 0.97, y: 10 }
                }
                animate={
                  isMobile
                    ? { y: 0, height: isExpanded ? SHEET_FULL : SHEET_HALF }
                    : { opacity: 1, scale: 1, y: 0 }
                }
                exit={
                  isMobile
                    ? { y: '100%' }
                    : { opacity: 0, scale: 0.97, y: 10 }
                }
                transition={SPRING}
                className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-surface shadow-xl flex flex-col overflow-hidden sm:max-h-[85vh] pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* ── Drag handle – mobile only ── */}
                <div
                  className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0 select-none touch-none"
                  style={{ cursor: 'grab' }}
                  onPointerDown={handleHandlePointerDown}
                  onPointerUp={handleHandlePointerUp}
                  onPointerCancel={() => {
                    pointerStartY.current = null
                  }}
                  aria-hidden="true"
                >
                  <div className="w-10 h-1 rounded-full bg-border/70" />
                </div>

                {/* ── Header ── */}
                <div className="flex items-center justify-between gap-3 px-4 pt-2 sm:pt-4 pb-3 border-b border-border/50 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green/10 text-green">
                      <PlusCircle className="h-5 w-5 stroke-[2.25]" />
                    </div>
                    <div>
                      <h2
                        id="add-modal-title"
                        className="text-base font-black text-warm-dark leading-tight"
                      >
                        Add Items to List
                      </h2>
                      <p className="text-[11px] font-medium text-warm-gray mt-0.5 leading-tight">
                        Browse your staples catalog
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-warm-gray hover:bg-cream hover:text-warm-dark transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* ── Catalog body ── */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-4 pt-3 pb-0">
                  {catalogItems.length === 0 ? (
                    /* Empty state */
                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream border border-border/60 text-warm-gray mb-3">
                        <BookOpen className="h-7 w-7 stroke-[1.75]" />
                      </div>
                      <p className="text-sm font-black text-warm-dark">Catalog is empty</p>
                      <p className="text-xs font-medium text-warm-gray mt-1 max-w-[220px] leading-relaxed">
                        Add your frequently bought staples to browse and batch-add them here.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAddCatalogOpen(true)}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-green text-white px-4 py-2.5 text-xs font-extrabold hover:bg-green-light active:scale-[0.96] transition-all"
                      >
                        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Add New Staple</span>
                      </button>
                    </div>
                  ) : (
                    /* Populated */
                    <>
                      {/* Search + New button row */}
                      <div className="flex items-center gap-2 mb-2.5 shrink-0">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-warm-gray" />
                          <input
                            type="text"
                            placeholder="Search staples..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl bg-cream border border-border/80 pl-9 pr-3 py-2 text-xs font-semibold text-warm-dark focus:border-green focus:outline-none transition-colors"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddCatalogOpen(true)}
                          title="Add new staple to catalog"
                          aria-label="Add new staple to catalog"
                          className="flex items-center gap-1 rounded-xl border border-border/80 bg-cream px-3 py-2 text-xs font-bold text-warm-dark hover:border-green hover:text-green hover:bg-green/5 active:scale-[0.96] transition-all shrink-0"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>New</span>
                        </button>
                      </div>

                      {/* Scrollable list – scrolling expands the sheet on mobile */}
                      <div
                        className="flex-1 overflow-y-auto space-y-1.5 pb-2 min-h-0"
                        onScroll={handleListScroll}
                      >
                        {filteredCatalog.length === 0 ? (
                          <div className="py-8 text-center">
                            <p className="text-xs font-semibold text-warm-gray">
                              No matching staples found
                            </p>
                          </div>
                        ) : (
                          filteredCatalog.map((item) => {
                            const isSelected = selectedIds.has(item.id)
                            return (
                              <div
                                key={item.id}
                                onClick={() => handleToggleSelect(item.id)}
                                className={`flex items-center justify-between rounded-xl border px-3 py-2.5 transition-all cursor-pointer select-none ${
                                  isSelected
                                    ? 'bg-green/10 border-green'
                                    : 'bg-cream/50 border-border/70 hover:border-border'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <div
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
                                      isSelected
                                        ? 'border-green bg-green text-white'
                                        : 'border-border/80 bg-surface'
                                    }`}
                                  >
                                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                  </div>
                                  <span className="font-bold text-sm text-warm-dark truncate">
                                    {item.name}
                                  </span>
                                </div>
                                {item.defaultPrice > 0 && (
                                  <span className="text-xs font-semibold text-warm-gray ml-2 shrink-0">
                                    ₱{item.defaultPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* ── Footer ── */}
                {catalogItems.length > 0 && (
                  <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between gap-3 shrink-0">
                    <span className="text-xs font-bold text-warm-gray tabular-nums">
                      {selectedIds.size} selected
                    </span>
                    <button
                      type="button"
                      onClick={handleBatchAdd}
                      disabled={selectedIds.size === 0}
                      className="rounded-xl bg-green px-5 py-2 text-xs font-bold text-white hover:bg-green-light active:scale-[0.96] disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                      Add {selectedIds.size > 0 ? selectedIds.size : ''}{' '}
                      {selectedIds.size === 1 ? 'Item' : 'Items'}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nested catalog-add modal */}
      <AddCatalogItemModal
        isOpen={isAddCatalogOpen}
        onClose={() => setIsAddCatalogOpen(false)}
        onAdd={(newItem) => {
          handleCatalogItemAdded(newItem)
          setIsAddCatalogOpen(false)
        }}
      />
    </>
  )
}
