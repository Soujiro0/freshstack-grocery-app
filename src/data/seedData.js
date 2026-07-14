import { generateId } from '../utils/id'

/** @type {import('../types/contracts.js').GroceryState} */
export const seedState = {
  items: [
    { id: generateId(), name: 'Organic Bananas', isChecked: false, quantity: 1, price: 90 },
    { id: generateId(), name: 'Whole Milk', isChecked: true, quantity: 1, price: 110 },
    { id: generateId(), name: 'Artisan Sourdough Bread', isChecked: false, quantity: 1, price: 150 },
    { id: generateId(), name: 'Free-Range Brown Eggs', isChecked: false, quantity: 1, price: 240 },
    { id: generateId(), name: 'Hass Avocados', isChecked: false, quantity: 1, price: 180 },
  ],
  catalog: [],
}
