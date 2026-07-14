import { useState, useMemo } from 'react'
import { Plus, Search, Trash2, BookOpen, Check, ArrowRight } from 'lucide-react'
import { useGrocery } from '../store/GroceryContext'
import AddCatalogItemModal from './AddCatalogItemModal'

export default function CatalogView({ onSwitchToList }) {
  const { state, actions } = useGrocery()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const catalogItems = state.catalog || []

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return state.catalog || []
    const q = searchQuery.toLowerCase().trim()
    return (state.catalog || []).filter((item) => item.name.toLowerCase().includes(q))
  }, [state.catalog, searchQuery])

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

  function handleSelectAll() {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredItems.map((item) => item.id)))
    }
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
    setSelectedIds(new Set())
    if (onSwitchToList) {
      onSwitchToList()
    }
  }

  function handleRemoveItem(id, e) {
    e.stopPropagation()
    actions.removeFromCatalog({ id })
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-2xl mx-auto w-full pb-28">
      {/* Top Controls: Search Bar + Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-gray" />
          <input
            type="text"
            placeholder="Search your staples catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-surface border border-border/80 pl-11 pr-4 py-3 text-sm font-semibold text-warm-dark placeholder:text-warm-muted focus:border-green focus:outline-none shadow-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-warm-gray hover:text-warm-dark"
            >
              Clear
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-green px-5 py-3 text-sm font-extrabold text-white hover:bg-green-light active:scale-95 transition-all shadow-none shrink-0"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
          <span>Add Catalog Item</span>
        </button>
      </div>

      {/* Catalog Header Info / Select All */}
      {filteredItems.length > 0 && (
        <div className="flex items-center justify-between px-2 mb-3 text-xs font-bold text-warm-gray">
          <button
            type="button"
            onClick={handleSelectAll}
            className="flex items-center gap-2 hover:text-warm-dark transition-colors"
          >
            <div
              className={`h-4 w-4 rounded-md border flex items-center justify-center transition-all ${
                selectedIds.size === filteredItems.length && filteredItems.length > 0
                  ? 'bg-green border-green text-white'
                  : 'bg-surface border-border/80'
              }`}
            >
              {selectedIds.size === filteredItems.length && filteredItems.length > 0 && (
                <Check className="h-3 w-3 stroke-[3]" />
              )}
            </div>
            <span>
              {selectedIds.size === filteredItems.length && filteredItems.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </span>
          </button>
          <span>
            {selectedIds.size} of {catalogItems.length} selected
          </span>
        </div>
      )}

      {/* Catalog Items List */}
      {filteredItems.length === 0 ? (
        <div className="my-auto py-16 text-center animate-fadeIn">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border/60 text-warm-gray mb-4">
            <BookOpen className="h-8 w-8 stroke-[1.75]" />
          </div>
          <h3 className="text-base font-black text-warm-dark">
            {searchQuery ? 'No matching staples found' : 'Your Staples Catalog is empty'}
          </h3>
          <p className="text-xs font-medium text-warm-gray mt-1.5 max-w-xs mx-auto leading-relaxed">
            {searchQuery
              ? 'Try searching for a different item name.'
              : 'Add your frequently bought items here so you can check off staples in seconds!'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-surface border border-border/80 px-4 py-2.5 text-xs font-bold text-warm-dark hover:bg-cream transition-colors"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add Your First Staple</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.has(item.id)
            return (
              <div
                key={item.id}
                onClick={() => handleToggleSelect(item.id)}
                className={`group relative flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-green/10 border-green text-warm-dark shadow-2xs'
                    : 'bg-surface border-border/70 text-warm-dark hover:border-border hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                      isSelected
                        ? 'border-green bg-green text-white'
                        : 'border-border/80 bg-cream group-hover:border-warm-gray'
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm sm:text-base break-words">
                      {item.name}
                    </div>
                    {item.defaultPrice > 0 && (
                      <div className="text-xs font-semibold text-warm-gray mt-0.5">
                        Default: ₱{item.defaultPrice.toFixed(2)} / pcs
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-3">
                  <button
                    type="button"
                    onClick={(e) => handleRemoveItem(item.id, e)}
                    className="rounded-lg p-2 text-warm-gray hover:bg-cream hover:text-red transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Remove from catalog"
                    aria-label="Remove from catalog"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Floating Batch Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-40 px-4 flex justify-center animate-slideUp">
          <div className="w-full max-w-md bg-warm-dark text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 border border-warm-gray/30">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-green text-white font-black text-sm flex items-center justify-center">
                {selectedIds.size}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black tracking-tight">
                  {selectedIds.size === 1 ? '1 staple selected' : `${selectedIds.size} staples selected`}
                </div>
                <div className="text-[11px] text-warm-muted">
                  Ready to add to Daily List
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBatchAdd}
              className="flex items-center gap-2 rounded-xl bg-green px-5 py-2.5 text-xs sm:text-sm font-black text-white hover:bg-green-light active:scale-95 transition-all shadow-none shrink-0"
            >
              <span>Add to List</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* Modal for adding a custom item to the catalog */}
      <AddCatalogItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(item) => actions.addToCatalog(item)}
      />
    </div>
  )
}
