import { useState, useEffect, useRef, useMemo } from 'react'
import { PlusCircle, X, Plus, Minus, BookOpen, Check, Search } from 'lucide-react'
import { useGrocery } from '../store/GroceryContext'

export default function AddItemModal({ isOpen, onClose, onAdd }) {
  const { state, actions } = useGrocery()
  const [activeTab, setActiveTab] = useState('catalog') // 'catalog' | 'manual'
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const inputRef = useRef(null)

  const catalogItems = state.catalog || []

  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return state.catalog || []
    const q = searchQuery.toLowerCase().trim()
    return (state.catalog || []).filter((item) => item.name.toLowerCase().includes(q))
  }, [state.catalog, searchQuery])

  useEffect(() => {
    if (isOpen) {
      setName('')
      setQuantity(1)
      setSearchQuery('')
      setSelectedIds(new Set())
      setActiveTab(catalogItems.length > 0 ? 'catalog' : 'manual')
      document.body.style.overflow = 'hidden'
      if (catalogItems.length === 0) {
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus()
        }, 50)
      }
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, catalogItems.length])

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

  function handleManualSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    onAdd({ name: trimmed, quantity: Math.max(1, quantity) })
    onClose()
  }

  function handleToggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
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
      }))

    actions.batchAddToList({ items: itemsToAdd })
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl animate-scaleUp flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green/10 text-green">
              <PlusCircle className="h-5 w-5 stroke-[2.25]" />
            </div>
            <div>
              <h2 id="add-modal-title" className="text-lg font-black text-warm-dark leading-tight">
                Add Items to List
              </h2>
              <p className="text-xs font-medium text-warm-gray mt-0.5">
                Browse your staples or enter manually
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

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-cream p-1 my-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              activeTab === 'catalog'
                ? 'bg-surface text-green shadow-2xs font-extrabold'
                : 'text-warm-gray hover:text-warm-dark'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>From Catalog ({catalogItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('manual')
              setTimeout(() => {
                if (inputRef.current) inputRef.current.focus()
              }, 50)
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              activeTab === 'manual'
                ? 'bg-surface text-green shadow-2xs font-extrabold'
                : 'text-warm-gray hover:text-warm-dark'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Manual Entry</span>
          </button>
        </div>

        {/* Tab Content 1: Catalog Multi-Select */}
        {activeTab === 'catalog' ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {catalogItems.length === 0 ? (
              <div className="py-10 text-center my-auto">
                <p className="text-xs font-semibold text-warm-gray max-w-xs mx-auto leading-relaxed">
                  Your Staples Catalog is currently empty. Use the hamburger navigation menu in the header to visit the Catalog hub and add your everyday items!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('manual')
                    setTimeout(() => {
                      if (inputRef.current) inputRef.current.focus()
                    }, 50)
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-green/10 text-green px-4 py-2 text-xs font-extrabold hover:bg-green/20 transition-colors"
                >
                  <span>Switch to Manual Entry</span>
                </button>
              </div>
            ) : (
              <>
                <div className="relative mb-3 shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-gray" />
                  <input
                    type="text"
                    placeholder="Search staples..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl bg-cream border border-border/80 pl-10 pr-4 py-2 text-xs font-semibold text-warm-dark focus:border-green focus:outline-none transition-colors shadow-none"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
                  {filteredCatalog.map((item) => {
                    const isSelected = selectedIds.has(item.id)
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleSelect(item.id)}
                        className={`flex items-center justify-between rounded-xl border p-3 transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-green/10 border-green text-warm-dark'
                            : 'bg-cream/50 border-border/70 text-warm-dark hover:border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                              isSelected
                                ? 'border-green bg-green text-white'
                                : 'border-border/80 bg-surface'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="font-bold text-sm truncate">
                            {item.name}
                          </span>
                        </div>
                        {item.defaultPrice > 0 && (
                          <span className="text-xs font-semibold text-warm-gray">
                            ₱{item.defaultPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between gap-3 shrink-0">
                  <span className="text-xs font-bold text-warm-gray">
                    {selectedIds.size} selected
                  </span>
                  <button
                    type="button"
                    onClick={handleBatchAdd}
                    disabled={selectedIds.size === 0}
                    className="rounded-xl bg-green px-5 py-2.5 text-xs font-bold text-white hover:bg-green-light active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-none"
                  >
                    Add {selectedIds.size > 0 ? selectedIds.size : ''} {selectedIds.size === 1 ? 'Item' : 'Items'}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Tab Content 2: Manual Single Item Entry */
          <form onSubmit={handleManualSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warm-gray mb-2">
                  Item Name
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
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl bg-cream border border-border/80 p-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-8 w-8 rounded-lg flex items-center justify-center bg-surface border border-border/60 text-warm-dark hover:bg-cream-dark active:scale-95 font-bold shadow-none"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4 stroke-2" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        setQuantity(isNaN(val) ? 1 : Math.max(1, val))
                      }}
                      className="w-12 text-center bg-transparent border-none text-sm font-mono font-bold text-warm-dark focus:outline-none tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center bg-surface border border-border/60 text-warm-dark hover:bg-cream-dark active:scale-95 font-bold shadow-none"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4 stroke-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 shrink-0">
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
                Add Item
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
