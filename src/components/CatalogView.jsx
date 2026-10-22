import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Plus, Search, BookOpen, CheckCheck, Upload, CheckCircle2, AlertTriangle } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useGrocery } from '../store/GroceryContext'
import { sortItems, findCatalogItemFor, mergeCatalog } from '../store/groceryReducer'
import { parseCatalogCsv } from '../utils/catalogCsv'
import { exportCatalogCsv } from '../utils/catalogTransfer'
import CatalogDataMenu from './CatalogDataMenu'
import ImportCatalogModal from './ImportCatalogModal'
import AddCatalogItemModal from './AddCatalogItemModal'
import SortControls from './SortControls'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import EditCatalogItemDrawer from './EditCatalogItemDrawer'
import EmptyState from './EmptyState'
import CatalogItemRow from './CatalogItemRow'
import CatalogSelectionBar from './CatalogSelectionBar'

export default function CatalogView({ onSwitchToList }) {
  const { state, actions } = useGrocery()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState('default')
  const [editingItem, setEditingItem] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [pendingImport, setPendingImport] = useState(null) // { fileName, items, added, updated, unchanged, skipped }
  const [notice, setNotice] = useState(null) // { tone: 'success' | 'error', text }
  const fileInputRef = useRef(null)

  const catalogItems = state.catalog || []

  // Auto-hide the import/export notice
  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(null), 5000)
    return () => clearTimeout(timer)
  }, [notice])
  const isSearching = Boolean(searchQuery.trim())

  const filteredItems = useMemo(() => {
    let result = state.catalog || []
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((item) => item.name.toLowerCase().includes(q))
    }
    return sortItems(result, sortOrder)
  }, [state.catalog, searchQuery, sortOrder])

  // Staple ids that have a linked item on today's list (by catalogId, else by name)
  const onListIds = useMemo(() => {
    const ids = new Set()
    for (const item of state.items || []) {
      const linked = findCatalogItemFor(item, state.catalog || [])
      if (linked) ids.add(linked.id)
    }
    return ids
  }, [state.items, state.catalog])

  const onListCount = onListIds.size

  const allFilteredSelected =
    filteredItems.length > 0 && filteredItems.every((item) => selectedIds.has(item.id))

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  function handleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) {
        filteredItems.forEach((item) => next.delete(item.id))
      } else {
        filteredItems.forEach((item) => next.add(item.id))
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
        catalogId: item.id,
      }))

    actions.batchAddToList({ items: itemsToAdd })
    setSelectedIds(new Set())
    if (onSwitchToList) {
      onSwitchToList()
    }
  }

  function handleRemoveItem(id) {
    actions.removeFromCatalog({ id })
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function handleSaveEdit({ id, newName, newPrice }) {
    actions.updateCatalogItem({ id, newName, newPrice })
    setEditingItem(null)
  }

  function handleOpenImport() {
    fileInputRef.current?.click()
  }

  async function handleFilePicked(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow picking the same file again
    if (!file) return
    try {
      const { items, skipped } = parseCatalogCsv(await file.text())
      const { added, updated, unchanged } = mergeCatalog(catalogItems, items)
      setPendingImport({ fileName: file.name, items, added, updated, unchanged, skipped })
    } catch (error) {
      console.error('Failed to read catalog CSV:', error)
      setNotice({ tone: 'error', text: 'Could not read that file. Please choose a CSV file.' })
    }
  }

  function handleConfirmImport() {
    if (!pendingImport) return
    const { items, added, updated } = pendingImport
    actions.importCatalog({ items })
    setPendingImport(null)
    const parts = []
    if (added) parts.push(`${added} new`)
    if (updated) parts.push(`${updated} updated`)
    setNotice({ tone: 'success', text: `Imported staples: ${parts.join(', ')}.` })
  }

  async function handleExport() {
    try {
      const result = await exportCatalogCsv(catalogItems)
      if (result.method === 'saved') {
        setNotice({ tone: 'success', text: `Saved to ${result.location}` })
      } else if (result.method === 'downloaded') {
        setNotice({ tone: 'success', text: `Downloaded ${result.filename}` })
      }
    } catch (error) {
      if (/cancel/i.test(error?.message || '')) return
      console.error('Failed to export catalog:', error)
      setNotice({
        tone: 'error',
        text:
          error?.code === 'PERMISSION_DENIED'
            ? 'Storage permission is needed to save the file.'
            : 'Could not export the catalog. Please try again.',
      })
    }
  }

  return (
    <div className="px-4 pb-32 overflow-x-hidden">
      {/* 1. Catalog Summary (mirrors Shopping Progress on the List page) */}
      {catalogItems.length > 0 && (
        <div className="mt-4 w-full">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-warm-gray">
              <BookOpen className="h-4 w-4 text-green" />
              <span>Staples Catalog</span>
            </div>
            <CatalogDataMenu
              onImport={handleOpenImport}
              onExport={handleExport}
              canExport={catalogItems.length > 0}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-warm-dark">
            <span className="font-mono text-xs text-warm-dark">
              {catalogItems.length === 1 ? '1 staple saved' : `${catalogItems.length} staples saved`}
            </span>
            {onListCount > 0 && (
              <span className="rounded-full bg-green/15 text-green font-mono font-black px-2 py-0.5 text-[11px]">
                {onListCount} on list
              </span>
            )}
          </div>
        </div>
      )}

      {/* 2. Search, Add Staple & Sort Controls Row */}
      <div className="mt-4 flex items-center gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-gray" />
          <input
            type="text"
            placeholder="Search staples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-xl bg-surface border border-border/80 pl-9 pr-12 text-xs font-semibold text-warm-dark placeholder:text-warm-muted focus:border-green focus:outline-none shadow-none transition-colors"
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
          className="rounded-xl bg-green px-4 h-10 text-xs font-bold text-white transition-all hover:bg-green-light active:scale-[0.98] flex items-center gap-1.5 shadow-none shrink-0"
        >
          <Plus className="h-4 w-4 stroke-2" />
          <span>Add Staple</span>
        </button>

        {catalogItems.length > 1 && (
          <SortControls sortOrder={sortOrder} onSortChange={setSortOrder} />
        )}
      </div>

      {/* Import / Export result */}
      {notice && (
        <div
          role="status"
          className={`mt-3 flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold ${
            notice.tone === 'error'
              ? 'bg-danger-muted border-danger/20 text-danger'
              : 'bg-green-muted border-green-border text-green'
          }`}
        >
          {notice.tone === 'error' ? (
            <AlertTriangle className="h-4 w-4 shrink-0 stroke-[2.5]" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 stroke-[2.5]" />
          )}
          <span className="min-w-0 break-all">{notice.text}</span>
        </div>
      )}

      {/* Main Catalog Section */}
      <div className="mt-5">
        {catalogItems.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-6 w-6 text-warm-gray stroke-[1.75]" />}
            title="Your staples catalog is empty"
            description="Tap Add Staple above to save items you buy often, or import a CSV list."
            action={
              <button
                type="button"
                onClick={handleOpenImport}
                className="rounded-xl bg-surface border border-border/80 px-4 h-10 text-xs font-bold text-warm-dark hover:bg-cream-dark transition-colors flex items-center gap-1.5"
              >
                <Upload className="h-4 w-4 stroke-2" />
                <span>Import from CSV</span>
              </button>
            }
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<Search className="h-6 w-6 text-warm-gray stroke-[1.75]" />}
            title="No matching staples"
            description="Try a different name."
            action={
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="rounded-xl bg-surface border border-border/80 px-4 h-10 text-xs font-bold text-warm-dark hover:bg-cream-dark transition-colors"
              >
                Clear search
              </button>
            }
          />
        ) : (
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-warm-gray">
                {isSearching ? 'Results' : 'All Staples'} ({filteredItems.length})
              </h2>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-warm-gray hover:text-green transition-colors flex items-center gap-1.5"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>{allFilteredSelected ? 'Deselect all' : 'Select all'}</span>
              </button>
            </div>
            <div className="divide-y divide-border/50">
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <CatalogItemRow
                    key={item.id}
                    item={item}
                    isSelected={selectedIds.has(item.id)}
                    isOnList={onListIds.has(item.id)}
                    onToggle={handleToggleSelect}
                    onEdit={setEditingItem}
                    onRemove={setDeletingItem}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Selection Bar docked right above BottomNav */}
      <CatalogSelectionBar selectedCount={selectedIds.size} onAdd={handleBatchAdd} />

      {/* Modal for adding a custom item to the catalog */}
      <AddCatalogItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(item) => actions.addToCatalog(item)}
      />

      <EditCatalogItemDrawer
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        onConfirm={handleSaveEdit}
      />

      {/* Hidden picker for catalog CSV import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv,text/comma-separated-values,text/plain"
        onChange={handleFilePicked}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        data-testid="catalog-import-input"
      />

      <ImportCatalogModal
        preview={pendingImport}
        onConfirm={handleConfirmImport}
        onClose={() => setPendingImport(null)}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => {
          if (deletingItem) {
            handleRemoveItem(deletingItem.id)
            setDeletingItem(null)
          }
        }}
        itemName={deletingItem?.name || ''}
      />
    </div>
  )
}
