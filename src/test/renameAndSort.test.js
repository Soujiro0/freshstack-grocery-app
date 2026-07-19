import { describe, it, expect } from 'vitest'
import { groceryReducer, ACTION_TYPES, sortItems } from '../store/groceryReducer'

describe('Renaming and Sorting TDD', () => {
  it('renames an item in state.items', () => {
    const initialState = {
      items: [{ id: '1', name: 'Old Bread', isChecked: false, quantity: 1, price: 2 }],
      catalog: [],
    }

    const nextState = groceryReducer(initialState, {
      type: ACTION_TYPES.RENAME_ITEM,
      payload: { id: '1', newName: 'Whole Wheat Bread' },
    })

    expect(nextState.items[0].name).toBe('Whole Wheat Bread')
  })

  it('ignores empty newName when renaming an item', () => {
    const initialState = {
      items: [{ id: '1', name: 'Valid Bread', isChecked: false }],
      catalog: [],
    }

    const nextState = groceryReducer(initialState, {
      type: ACTION_TYPES.RENAME_ITEM,
      payload: { id: '1', newName: '   ' },
    })

    expect(nextState.items[0].name).toBe('Valid Bread')
  })

  it('renames an item in state.catalog', () => {
    const initialState = {
      items: [],
      catalog: [{ id: 'c1', name: 'Old Eggs', defaultPrice: 5 }],
    }

    const nextState = groceryReducer(initialState, {
      type: ACTION_TYPES.RENAME_CATALOG_ITEM,
      payload: { id: 'c1', newName: 'Free Range Eggs (Dozen)' },
    })

    expect(nextState.catalog[0].name).toBe('Free Range Eggs (Dozen)')
  })

  it('sortItems sorts ascending by name', () => {
    const items = [
      { id: '1', name: 'Zucchini' },
      { id: '2', name: 'Apples' },
      { id: '3', name: 'Milk' },
    ]

    const sorted = sortItems(items, 'asc')
    expect(sorted.map((i) => i.name)).toEqual(['Apples', 'Milk', 'Zucchini'])
  })

  it('sortItems sorts descending by name', () => {
    const items = [
      { id: '1', name: 'Zucchini' },
      { id: '2', name: 'Apples' },
      { id: '3', name: 'Milk' },
    ]

    const sorted = sortItems(items, 'desc')
    expect(sorted.map((i) => i.name)).toEqual(['Zucchini', 'Milk', 'Apples'])
  })

  it('sortItems preserves order when sortOrder is default or invalid', () => {
    const items = [
      { id: '1', name: 'Zucchini' },
      { id: '2', name: 'Apples' },
    ]

    const sorted = sortItems(items, 'default')
    expect(sorted.map((i) => i.name)).toEqual(['Zucchini', 'Apples'])
  })
})
