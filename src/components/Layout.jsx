import { useState } from 'react'
import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const activeView = location.pathname === '/catalog' ? 'catalog' : 'list'

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col bg-cream pb-16">
      <header className="px-4 py-4 border-b border-border/50 bg-cream/95 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface border border-border/80 text-warm-dark hover:bg-cream-dark active:scale-95 transition-all shadow-none"
            aria-label="Open menu"
            title="Open navigation menu"
          >
            <Menu className="h-5 w-5 stroke-[2.25]" />
          </button>
          <img
            src="/logo.svg"
            alt="FreshTrack Logo"
            className="h-10 w-10 shrink-0 rounded-xl shadow-none"
          />
          <div>
            <h1 className="text-lg font-black tracking-tight text-warm-dark leading-tight">
              FreshTrack <span className="text-green">Grocery</span>
            </h1>
            <p className="text-xs font-medium text-warm-gray">
              {activeView === 'catalog' ? 'Staples Catalog Hub' : 'Simple daily checklist'}
            </p>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {children}
      </main>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <BottomNav />
    </div>
  )
}
