import { generateId } from '../utils/id'

export const ACTION_TYPES = {
  ADD_ITEM: 'ADD_ITEM',
  TOGGLE_ITEM: 'TOGGLE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  UPDATE_PRICE: 'UPDATE_PRICE',
  RENAME_ITEM: 'RENAME_ITEM',
  CLEAR_CHECKED: 'CLEAR_CHECKED',
  CLEAR_UNCHECKED: 'CLEAR_UNCHECKED',
  CLEAR_ALL: 'CLEAR_ALL',
  ADD_TO_CATALOG: 'ADD_TO_CATALOG',
  REMOVE_FROM_CATALOG: 'REMOVE_FROM_CATALOG',
  RENAME_CATALOG_ITEM: 'RENAME_CATALOG_ITEM',
  UPDATE_CATALOG_ITEM: 'UPDATE_CATALOG_ITEM',
  BATCH_ADD_TO_LIST: 'BATCH_ADD_TO_LIST',
  HYDRATE_STATE: 'HYDRATE_STATE',
}

export function sortItems(items = [], sortOrder = 'default') {
  if (!Array.isArray(items)) return []
  if (sortOrder === 'asc') {
    return [...items].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }
  if (sortOrder === 'desc') {
    return [...items].sort((a, b) => (b.name || '').localeCompare(a.name || ''))
  }
  return [...items]
}


/** @param {import('../types/contracts.js').GroceryState} state */
/** @param {{ type: string, payload?: unknown }} action */
export function groceryReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.ADD_ITEM: {
      const { name, quantity, price } = /** @type {{ name: string, quantity?: number, price?: number }} */ (
        action.payload || {}
      )
      const trimmed = (name || '').trim()
      if (!trimmed) return state
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: generateId(),
            name: trimmed,
            isChecked: false,
            quantity: Math.max(1, quantity || 1),
            price: Math.max(0, price || 0),
          },
        ],
      }
    }

    case ACTION_TYPES.TOGGLE_ITEM: {
      const { id } = /** @type {{ id: string }} */ (action.payload || {})
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, isChecked: !item.isChecked } : item,
        ),
      }
    }

    case ACTION_TYPES.UPDATE_QUANTITY: {
      const { id, delta } = /** @type {{ id: string, delta: number }} */ (
        action.payload || {}
      )
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, (item.quantity ?? 1) + delta) }
            : item,
        ),
      }
    }

    case ACTION_TYPES.UPDATE_PRICE: {
      const { id, price } = /** @type {{ id: string, price: number }} */ (
        action.payload || {}
      )
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id
            ? { ...item, price: Math.max(0, price || 0) }
            : item,
        ),
      }
    }

    case ACTION_TYPES.REMOVE_ITEM: {
      const { id } = /** @type {{ id: string }} */ (action.payload || {})
      return {
        ...state,
        items: state.items.filter((item) => item.id !== id),
      }
    }

    case ACTION_TYPES.CLEAR_CHECKED: {
      return {
        ...state,
        items: state.items.filter((item) => !item.isChecked),
      }
    }

    case ACTION_TYPES.CLEAR_UNCHECKED: {
      return {
        ...state,
        items: state.items.filter((item) => item.isChecked),
      }
    }

    case ACTION_TYPES.CLEAR_ALL: {
      return {
        ...state,
        items: [],
      }
    }

    case ACTION_TYPES.ADD_TO_CATALOG: {
      const { name, defaultPrice } = /** @type {{ name: string, defaultPrice?: number }} */ (
        action.payload || {}
      )
      const trimmed = (name || '').trim()
      if (!trimmed) return state
      return {
        ...state,
        catalog: [
          ...(state.catalog || []),
          {
            id: generateId(),
            name: trimmed,
            defaultPrice: Math.max(0, defaultPrice || 0),
          },
        ],
      }
    }

    case ACTION_TYPES.REMOVE_FROM_CATALOG: {
      const { id } = /** @type {{ id: string }} */ (action.payload || {})
      return {
        ...state,
        catalog: (state.catalog || []).filter((item) => item.id !== id),
      }
    }

    case ACTION_TYPES.BATCH_ADD_TO_LIST: {
      const { items } = /** @type {{ items: Array<{ name: string, quantity?: number, price?: number }> }} */ (
        action.payload || {}
      )
      if (!Array.isArray(items) || items.length === 0) return state

      const newGroceryItems = items
        .filter((i) => i && i.name && i.name.trim())
        .map((i) => ({
          id: generateId(),
          name: i.name.trim(),
          isChecked: false,
          quantity: Math.max(1, i.quantity || 1),
          price: Math.max(0, i.price || 0),
        }))

      return {
        ...state,
        items: [...state.items, ...newGroceryItems],
      }
    }

    case ACTION_TYPES.HYDRATE_STATE: {
      const payload = /** @type {import('../types/contracts.js').GroceryState} */ (
        action.payload || {}
      )
      return {
        items: Array.isArray(payload.items) ? payload.items : state.items,
        catalog: Array.isArray(payload.catalog) ? payload.catalog : state.catalog || [],
      }
    }

    case ACTION_TYPES.RENAME_ITEM: {
      const { id, newName } = /** @type {{ id: string, newName: string }} */ (
        action.payload || {}
      )
      const trimmed = (newName || '').trim()
      if (!trimmed) return state
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, name: trimmed } : item
        ),
      }
    }

    case ACTION_TYPES.RENAME_CATALOG_ITEM: {
      const { id, newName } = /** @type {{ id: string, newName: string }} */ (
        action.payload || {}
      )
      const trimmed = (newName || '').trim()
      if (!trimmed) return state
      return {
        ...state,
        catalog: (state.catalog || []).map((item) =>
          item.id === id ? { ...item, name: trimmed } : item
        ),
      }
    }

    case ACTION_TYPES.UPDATE_CATALOG_ITEM: {
      const { id, newName, newPrice } = /** @type {{ id: string, newName: string, newPrice: number }} */ (
        action.payload || {}
      )
      const trimmed = (newName || '').trim()
      if (!trimmed) return state
      return {
        ...state,
        catalog: (state.catalog || []).map((item) =>
          item.id === id
            ? { ...item, name: trimmed, defaultPrice: Math.max(0, newPrice || 0) }
            : item
        ),
      }
    }

    default:
      return state
  }
}

export function addItem(payload) {
  return { type: ACTION_TYPES.ADD_ITEM, payload }
}

export function toggleItem(payload) {
  return { type: ACTION_TYPES.TOGGLE_ITEM, payload }
}

export function updateQuantity(payload) {
  return { type: ACTION_TYPES.UPDATE_QUANTITY, payload }
}

export function updatePrice(payload) {
  return { type: ACTION_TYPES.UPDATE_PRICE, payload }
}

export function removeItem(payload) {
  return { type: ACTION_TYPES.REMOVE_ITEM, payload }
}

export function clearChecked() {
  return { type: ACTION_TYPES.CLEAR_CHECKED }
}

export function clearUnchecked() {
  return { type: ACTION_TYPES.CLEAR_UNCHECKED }
}

export function clearAll() {
  return { type: ACTION_TYPES.CLEAR_ALL }
}

export function addToCatalog(payload) {
  return { type: ACTION_TYPES.ADD_TO_CATALOG, payload }
}

export function removeFromCatalog(payload) {
  return { type: ACTION_TYPES.REMOVE_FROM_CATALOG, payload }
}

export function renameItem(payload) {
  return { type: ACTION_TYPES.RENAME_ITEM, payload }
}

export function renameCatalogItem(payload) {
  return { type: ACTION_TYPES.RENAME_CATALOG_ITEM, payload }
}

export function batchAddToList(payload) {
  return { type: ACTION_TYPES.BATCH_ADD_TO_LIST, payload }
}

export function hydrateState(payload) {
  return { type: ACTION_TYPES.HYDRATE_STATE, payload }
}

export function updateCatalogItem(payload) {
  return { type: ACTION_TYPES.UPDATE_CATALOG_ITEM, payload }
}
