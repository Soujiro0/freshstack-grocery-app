import { describe, it, expect } from 'vitest'
import { groceryReducer, ACTION_TYPES } from '../store/groceryReducer'

describe('groceryReducer baseline', () => {
  const initialState = {
    items: [],
    catalog: [],
  }

  it('adds an item correctly', () => {
    const nextState = groceryReducer(initialState, {
      type: ACTION_TYPES.ADD_ITEM,
      payload: { name: 'Apples', quantity: 2, price: 5 },
    })

    expect(nextState.items).toHaveLength(1)
    expect(nextState.items[0]).toMatchObject({
      name: 'Apples',
      quantity: 2,
      price: 5,
      isChecked: false,
    })
  })

  it('toggles item isChecked state', () => {
    const stateWithItem = {
      items: [{ id: '1', name: 'Milk', isChecked: false, quantity: 1, price: 3 }],
      catalog: [],
    }

    const nextState = groceryReducer(stateWithItem, {
      type: ACTION_TYPES.TOGGLE_ITEM,
      payload: { id: '1' },
    })

    expect(nextState.items[0].isChecked).toBe(true)
  })

  it('removes an item correctly', () => {
    const stateWithItem = {
      items: [{ id: '1', name: 'Bread', isChecked: false }],
      catalog: [],
    }

    const nextState = groceryReducer(stateWithItem, {
      type: ACTION_TYPES.REMOVE_ITEM,
      payload: { id: '1' },
    })

    expect(nextState.items).toHaveLength(0)
  })

  it('adds an item to catalog', () => {
    const nextState = groceryReducer(initialState, {
      type: ACTION_TYPES.ADD_TO_CATALOG,
      payload: { name: 'Eggs', defaultPrice: 6 },
    })

    expect(nextState.catalog).toHaveLength(1)
    expect(nextState.catalog[0]).toMatchObject({
      name: 'Eggs',
      defaultPrice: 6,
    })
  })
})
