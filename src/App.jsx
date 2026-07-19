import { HashRouter } from 'react-router-dom'
import { GroceryProvider } from './store/GroceryContext'
import { UpdateProvider } from './contexts/UpdateContext'
import AppRoutes from './routes/AppRoutes'
import UpdateModal from './components/UpdateModal'

export default function App() {
  return (
    <UpdateProvider>
      <GroceryProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </GroceryProvider>
      <UpdateModal />
    </UpdateProvider>
  )
}
