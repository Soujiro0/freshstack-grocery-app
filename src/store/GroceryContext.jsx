/* oxlint-disable react/only-export-components */
import { createContext, useContext, useReducer, useMemo, useEffect, useRef } from 'react'
import {
  groceryReducer,
  addItem,
  toggleItem,
  updateQuantity,
  updatePrice,
  removeItem,
  clearChecked,
  clearAll,
  addToCatalog,
  removeFromCatalog,
  batchAddToList,
  hydrateState,
} from './groceryReducer'
import { seedState } from '../data/seedData'
import { loadStateFromStorage, saveStateToStorage } from '../utils/storage'

const GroceryContext = createContext(null)

export function GroceryProvider({ children }) {
  const [state, dispatch] = useReducer(groceryReducer, seedState)
  const isHydrated = useRef(false)

  // Hydrate from SharedPreferences / offline storage on mount
  useEffect(() => {
    let mounted = true
    loadStateFromStorage(seedState).then((loadedState) => {
      if (mounted && loadedState) {
        dispatch(hydrateState(loadedState))
        isHydrated.current = true
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  // Save to SharedPreferences / offline storage whenever state updates (after hydration)
  useEffect(() => {
    if (isHydrated.current) {
      saveStateToStorage(state)
    }
  }, [state])

  const actions = useMemo(
    () => ({
      addItem: (payload) => dispatch(addItem(payload)),
      toggleItem: (payload) => dispatch(toggleItem(payload)),
      updateQuantity: (payload) => dispatch(updateQuantity(payload)),
      updatePrice: (payload) => dispatch(updatePrice(payload)),
      removeItem: (payload) => dispatch(removeItem(payload)),
      clearChecked: () => dispatch(clearChecked()),
      clearAll: () => dispatch(clearAll()),
      addToCatalog: (payload) => dispatch(addToCatalog(payload)),
      removeFromCatalog: (payload) => dispatch(removeFromCatalog(payload)),
      batchAddToList: (payload) => dispatch(batchAddToList(payload)),
      hydrateState: (payload) => dispatch(hydrateState(payload)),
    }),
    [],
  )

  const value = useMemo(() => ({ state, dispatch, actions }), [state, actions])

  return (
    <GroceryContext.Provider value={value}>{children}</GroceryContext.Provider>
  )
}

export function useGrocery() {
  const context = useContext(GroceryContext)
  if (!context) {
    throw new Error('useGrocery must be used within a GroceryProvider')
  }
  return context
}
