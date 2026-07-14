import { useState } from 'react'
import { GroceryProvider } from './store/GroceryContext'
import Layout from './components/Layout'
import GroceryListView from './components/GroceryListView'
import CatalogView from './components/CatalogView'

function AppContent() {
  const [activeView, setActiveView] = useState('list') // 'list' | 'catalog'

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {activeView === 'catalog' ? (
        <CatalogView onSwitchToList={() => setActiveView('list')} />
      ) : (
        <GroceryListView />
      )}
    </Layout>
  )
}

export default function App() {
  return (
    <GroceryProvider>
      <AppContent />
    </GroceryProvider>
  )
}
