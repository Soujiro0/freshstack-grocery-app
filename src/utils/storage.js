import { Preferences } from '@capacitor/preferences'

const STORAGE_KEY = 'freshtrack_grocery_state_v1'

/**
 * Loads saved GroceryState from native SharedPreferences (or localStorage fallback).
 * @param {import('../types/contracts.js').GroceryState} fallbackSeed
 * @returns {Promise<import('../types/contracts.js').GroceryState>}
 */
export async function loadStateFromStorage(fallbackSeed) {
  try {
    const { value } = await Preferences.get({ key: STORAGE_KEY })
    if (!value) {
      return fallbackSeed
    }
    const parsed = JSON.parse(value)
    if (parsed && typeof parsed === 'object') {
      return {
        items: Array.isArray(parsed.items) ? parsed.items : fallbackSeed.items || [],
        catalog: Array.isArray(parsed.catalog) ? parsed.catalog : fallbackSeed.catalog || [],
      }
    }
    return fallbackSeed
  } catch (error) {
    console.error('Failed to load state from Capacitor Preferences:', error)
    return fallbackSeed
  }
}

/**
 * Saves current GroceryState to native SharedPreferences (or localStorage fallback).
 * @param {import('../types/contracts.js').GroceryState} state
 * @returns {Promise<void>}
 */
export async function saveStateToStorage(state) {
  try {
    if (!state) return
    const payload = JSON.stringify({
      items: Array.isArray(state.items) ? state.items : [],
      catalog: Array.isArray(state.catalog) ? state.catalog : [],
    })
    await Preferences.set({ key: STORAGE_KEY, value: payload })
  } catch (error) {
    console.error('Failed to save state to Capacitor Preferences:', error)
  }
}
