import { useNavigate } from 'react-router-dom'
import CatalogView from '../components/CatalogView'

export default function StapleCatalogPage() {
  const navigate = useNavigate()
  return <CatalogView onSwitchToList={() => navigate('/')} />
}
