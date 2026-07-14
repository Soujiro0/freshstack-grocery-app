/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   isChecked: boolean,
 *   quantity?: number,
 *   price?: number
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
