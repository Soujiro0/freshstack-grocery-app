import { HashRouter } from 'react-router-dom'
import { GroceryProvider } from './store/GroceryContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <GroceryProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </GroceryProvider>
  )
}
