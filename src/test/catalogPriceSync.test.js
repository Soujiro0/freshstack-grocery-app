import { describe, it, expect } from 'vitest'
import { groceryReducer, ACTION_TYPES, findCatalogItemFor } from '../store/groceryReducer'

const catalog = [
  { id: 'c1', name: 'Whole Milk', defaultPrice: 110 },
  { id: 'c2', name: 'Bananas', defaultPrice: 90 },
]

describe('Catalog ↔ List price sync', () => {
  it('stores catalogId when batch adding from the catalog', () => {
    const next = groceryReducer({ items: [], catalog }, {
      type: ACTION_TYPES.BATCH_ADD_TO_LIST,
      payload: { items: [{ name: 'Whole Milk', quantity: 1, price: 110, catalogId: 'c1' }] },
    })
    expect(next.items[0]).toMatchObject({ name: 'Whole Milk', price: 110, catalogId: 'c1' })
  })

  it('finds the linked staple by catalogId first, then by name', () => {
    expect(findCatalogItemFor({ name: 'Renamed', catalogId: 'c1' }, catalog)?.id).toBe('c1')
    expect(findCatalogItemFor({ name: '  bananas ' }, catalog)?.id).toBe('c2')
    expect(findCatalogItemFor({ name: 'Bananas', catalogId: 'gone' }, catalog)?.id).toBe('c2')
    expect(findCatalogItemFor({ name: 'Eggs' }, catalog)).toBeNull()
  })

  it('catalog price edit updates linked To Buy items but not On Cart items', () => {
    const state = {
      items: [
        { id: 'i1', name: 'Whole Milk', isChecked: false, quantity: 1, price: 110, catalogId: 'c1' },
        { id: 'i2', name: 'whole milk', isChecked: false, quantity: 2, price: 110 },
        { id: 'i3', name: 'Whole Milk', isChecked: true, quantity: 1, price: 105, catalogId: 'c1' },
        { id: 'i4', name: 'Bananas', isChecked: false, quantity: 1, price: 90 },
      ],
      catalog,
    }
    const next = groceryReducer(state, {
      type: ACTION_TYPES.UPDATE_CATALOG_ITEM,
      payload: { id: 'c1', newName: 'Fresh Milk', newPrice: 120 },
    })

    expect(next.catalog[0]).toMatchObject({ name: 'Fresh Milk', defaultPrice: 120 })
    expect(next.items[0].price).toBe(120)
    // Name-matched item is now linked by id, so the rename doesn't break it
    expect(next.items[1]).toMatchObject({ price: 120, catalogId: 'c1' })
    expect(next.items[2].price).toBe(105)
    expect(next.items[3].price).toBe(90)
  })

  it('a rename without a price change leaves list prices alone', () => {
    const state = {
      items: [{ id: 'i1', name: 'Whole Milk', isChecked: false, quantity: 1, price: 99, catalogId: 'c1' }],
      catalog,
    }
    const next = groceryReducer(state, {
      type: ACTION_TYPES.UPDATE_CATALOG_ITEM,
      payload: { id: 'c1', newName: 'Milk', newPrice: 110 },
    })
    expect(next.items[0].price).toBe(99)
  })

  it('setting a price on the list saves it back to the staple', () => {
    const state = {
      items: [
        { id: 'i1', name: 'Bananas', isChecked: false, quantity: 1, price: 90 },
        { id: 'i2', name: 'Bananas', isChecked: false, quantity: 1, price: 90, catalogId: 'c2' },
        { id: 'i3', name: 'Bananas', isChecked: true, quantity: 1, price: 88, catalogId: 'c2' },
      ],
      catalog,
    }
    const next = groceryReducer(state, {
      type: ACTION_TYPES.UPDATE_PRICE,
      payload: { id: 'i1', price: 95 },
    })

    expect(next.catalog[1].defaultPrice).toBe(95)
    expect(next.items[0]).toMatchObject({ price: 95, catalogId: 'c2' })
    expect(next.items[1].price).toBe(95)
    expect(next.items[2].price).toBe(88)
  })

  it('a cleared (0) list price does not wipe the staple default', () => {
    const state = {
      items: [{ id: 'i1', name: 'Bananas', isChecked: false, quantity: 1, price: 90, catalogId: 'c2' }],
      catalog,
    }
    const next = groceryReducer(state, {
      type: ACTION_TYPES.UPDATE_PRICE,
      payload: { id: 'i1', price: 0 },
    })
    expect(next.items[0].price).toBe(0)
    expect(next.catalog[1].defaultPrice).toBe(90)
  })

  it('items with no matching staple only change their own price', () => {
    const state = {
      items: [{ id: 'i1', name: 'Eggs', isChecked: false, quantity: 1, price: 0 }],
      catalog,
    }
    const next = groceryReducer(state, {
      type: ACTION_TYPES.UPDATE_PRICE,
      payload: { id: 'i1', price: 240 },
    })
    expect(next.items[0].price).toBe(240)
    expect(next.catalog).toBe(catalog)
  })
})
