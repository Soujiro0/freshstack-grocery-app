/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   isChecked: boolean,
 *   quantity?: number,
 *   price?: number,
 *   catalogId?: string
 * }} GroceryItem
 */

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   defaultPrice?: number
 * }} CatalogItem
 */

/**
 * @typedef {{
 *   items: GroceryItem[],
 *   catalog?: CatalogItem[]
 * }} GroceryState
 */
