import { Routes, Route } from 'react-router-dom'
import Layout from '../components/Layout'
import GroceryListPage from '../pages/GroceryListPage'
import StapleCatalogPage from '../pages/StapleCatalogPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <GroceryListPage />
          </Layout>
        }
      />
      <Route
        path="/catalog"
        element={
          <Layout>
            <StapleCatalogPage />
          </Layout>
        }
      />
    </Routes>
  )
}
