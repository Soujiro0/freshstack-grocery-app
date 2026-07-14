# Single-Screen Grocery Catalog (`Need to Buy` vs `In Stock at Home`)

## Problem Statement
How might we create a single, unified grocery checklist and catalog where a shopper can instantly transition items between what they need for today's trip (`Need to Buy`) and what they already have (`In Stock at Home`), while automatically remembering quantities and prices for the future?

## Recommended Direction
**The Single-Screen Two-Tier Catalog Engine (`status: 'NEED_TO_BUY' | 'IN_STOCK'`).**

Instead of managing separate slide-up drawers or multi-tab navigation, your entire grocery app lives on **one crystal-clear screen** divided into two sections:

### 1. `🛒 Need to Buy` (Active Shopping Trip)
- Displays all items currently needed for today's store run (`status: 'NEED_TO_BUY'`).
- Each row (`GroceryItemRow`) features:
  - A **Checkbox** (`isChecked`) to check off items as you place them in your physical shopping cart.
  - Interactive **Quantity Stepper (`−`/`+`)** and **Price per unit (`$`)** inputs so you can log accurate store prices.
- **Trip Progress & Ticker:** Shows `Checked vs Total` count alongside real-time estimated costs ($).

### 2. `🏠 In Stock at Home` (Your Usual Items Catalog)
- Displays all usual items that are currently stocked at home or not needed right now (`status: 'IN_STOCK'`).
- Rendered in a clean, compact grid/list (`Milk ($4.49)`, `Eggs ($5.99)`, `Bread ($3.99)`).
- **Planning for next trip:** When you run out of an item during the week, simply tap **`+ Add to Trip`** (or tap the item card). **Pop!** It instantly moves up into `🛒 Need to Buy` (`status: 'NEED_TO_BUY', isChecked: false`) with its exact saved price (`$4.49`) and default quantity (`×1`).

### 3. The Smart `COMPLETE_TRIP` Engine
When you finish shopping and click **`✨ Complete Shopping Trip ({checkedCount})`**:
- A confirmation modal (`CompleteTripModal`) shows the summary of purchased items.
- Upon confirmation:
  1. All checked items (`isChecked: true && status === 'NEED_TO_BUY'`) automatically transition right down to **`🏠 In Stock at Home` (`status: 'IN_STOCK', isChecked: false`)**.
  2. Any price or quantity adjustments you made during the trip are **permanently saved** as that item's new default for the future.
  3. Unchecked items (`isChecked: false && status === 'NEED_TO_BUY'`) remain right inside `🛒 Need to Buy` for your next run.
  4. If you ever want to permanently remove an item from your catalog forever, you click the `✕ Delete` button on the row/card.

## Key Assumptions to Validate
- [ ] **Assumption 1 (Single-Screen Clarity):** Having both `Need to Buy` and `In Stock at Home` on one screen is faster and more scannable than jumping between modals or separate screens.
- [ ] **Assumption 2 (Catalog Accretion):** Every new item you add via the top text box (`AddItemForm`) automatically enters your permanent household catalog once bought (`IN_STOCK`), making your app smarter with every trip.
- [ ] **Assumption 3 (One-Tap Restock):** Tapping an `In Stock` item to send it up to `Need to Buy` is the lowest possible friction for building weekly grocery lists.

## MVP Scope
### In Scope
- **Contract (`contracts.js`):** Add `status: 'NEED_TO_BUY' | 'IN_STOCK'` (replacing `isEssential`). Keep `isChecked`, `quantity`, and `price`.
- **Reducer (`groceryReducer.js` & `GroceryContext.jsx`):**
  - `ADD_ITEM`: Adds directly to `status: 'NEED_TO_BUY'`.
  - `RESTOCK_ITEM`: Transitions `status: 'IN_STOCK'` $\rightarrow$ `status: 'NEED_TO_BUY'`.
  - `COMPLETE_TRIP`: Transitions `isChecked && status === 'NEED_TO_BUY'` $\rightarrow$ `status: 'IN_STOCK' && isChecked: false`.
- **UI (`GroceryListView.jsx` & `InStockItemRow.jsx`):**
  - Section 1: `🛒 Need to Buy ({count})` with full `GroceryItemRow` controls.
  - Section 2: `🏠 In Stock at Home ({count})` with compact, tap-to-add cards (`+ Add to Trip`) and `✕ Delete` controls.
  - Update `CompleteTripModal.jsx` to reflect moving items into `In Stock at Home`.
- **Seed Data (`seedData.js`):**
  - 3 items in `status: 'NEED_TO_BUY'` (`Organic Bananas`, `Whole Milk`, `Sourdough Bread`).
  - 3 items in `status: 'IN_STOCK'` (`Free-Range Eggs ($5.99)`, `Extra Virgin Olive Oil ($12.50)`, `Coffee Beans ($14.99)`).

## Not Doing (and Why)
- **Separate Slide-Up Drawer / Bottom Sheet:** Eliminated per your feedback; single-screen section grouping is cleaner and requires zero clicks to view what you have.
- **Complex Two-Tab Navigation:** Eliminated; one scrolling screen is faster on mobile.
