import { useEffect } from 'react'
import { X, CheckSquare, BookOpen, Sparkles } from 'lucide-react'
import { useGrocery } from '../store/GroceryContext'

export default function Sidebar({ isOpen, onClose, activeView, setActiveView }) {
  const { state } = useGrocery()
  const itemsCount = (state.items || []).length
  const catalogCount = (state.catalog || []).length

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

  function handleSelectView(view) {
    setActiveView(view)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation sidebar"
      className="fixed inset-0 z-50 flex animate-fadeIn bg-black/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-80 max-w-[85vw] bg-surface h-full shadow-2xl flex flex-col border-r border-border/80 animate-slideRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="FreshTrack Logo"
              className="h-10 w-10 shrink-0 rounded-xl shadow-none"
            />
            <div>
              <h2 className="text-base font-black text-warm-dark leading-tight">
                FreshTrack
              </h2>
              <p className="text-xs font-medium text-green mt-0.5">
                Navigation Hub
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-warm-gray hover:bg-cream hover:text-warm-dark transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 stroke-[2.25]" />
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-warm-gray px-3 py-2">
            Main Views
          </div>

          <button
            type="button"
            onClick={() => handleSelectView('list')}
            className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${
              activeView === 'list'
                ? 'bg-green/15 text-green border border-green/30 shadow-none'
                : 'text-warm-dark hover:bg-cream/70 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="h-5 w-5 stroke-[2.25]" />
              <span>My Daily List</span>
            </div>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-md font-bold ${
                activeView === 'list'
                  ? 'bg-green text-white'
                  : 'bg-cream text-warm-gray'
              }`}
            >
              {itemsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectView('catalog')}
            className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${
              activeView === 'catalog'
                ? 'bg-green/15 text-green border border-green/30 shadow-none'
                : 'text-warm-dark hover:bg-cream/70 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 stroke-[2.25]" />
              <span>Staples Catalog</span>
            </div>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-md font-bold ${
                activeView === 'catalog'
                  ? 'bg-green text-white'
                  : 'bg-cream text-warm-gray'
              }`}
            >
              {catalogCount}
            </span>
          </button>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-5 border-t border-border/60 bg-cream/40">
          <div className="flex items-center gap-2 text-xs font-bold text-warm-dark">
            <Sparkles className="h-4 w-4 text-green" />
            <span>Pro Tip</span>
          </div>
          <p className="text-[11px] font-medium text-warm-gray mt-1 leading-relaxed">
            Add your favorite everyday items into your Staples Catalog so you can check them off in seconds anytime!
          </p>
        </div>
      </div>
    </div>
  )
}
