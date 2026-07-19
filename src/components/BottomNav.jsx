import { NavLink } from 'react-router-dom'
import { CheckSquare, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BottomNav() {
  const tabs = [
    { name: 'List', path: '/', icon: CheckSquare },
    { name: 'Catalog', path: '/catalog', icon: BookOpen },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-cream/95 backdrop-blur-md border-t border-border/80 h-16 px-4 flex items-center justify-center sm:max-w-2xl sm:mx-auto shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around w-full max-w-sm mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-6 py-1.5 rounded-2xl transition-colors select-none ${
                  isActive ? 'text-green font-extrabold' : 'text-warm-gray font-semibold hover:text-warm-dark'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavTab"
                      className="absolute inset-0 bg-green/10 rounded-2xl -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <Icon className="h-5 w-5 stroke-[2.25]" />
                  <span className="text-xs tracking-tight">{tab.name}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
