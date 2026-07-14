# Grocery List Reuse & Price Memory (Starred Essentials)

## Problem Statement
How might we enable a solo mobile shopper to effortlessly carry over recurring grocery items—along with their quantities and unit prices—without retyping them or managing multi-tab templates every week?

## Recommended Direction
**Starred Essentials (`isEssential: boolean`) with Price & Quantity Memory.**
We preserve our sleek single-view shopping list architecture (`GroceryListView.jsx`) but give every item an inline **`⭐ Essential`** toggle. 

When the user finishes their grocery run and clicks **Complete Shopping Trip**:
1. All checked **One-Off items** (`isEssential: false && isChecked: true`) are deleted from the list.
2. All checked **Essential items** (`isEssential: true && isChecked: true`) are automatically reset to `isChecked: false`, retaining their item name, last-purchased `quantity`, and last-purchased `price`.
3. If an essential item's price or quantity was updated during the trip, that new value becomes the permanent default for the next trip.
4. A rich confirmation modal (`CompleteTripModal`) is displayed before finalizing, summarizing exactly which essential items will carry over and which one-off items will be cleared.

## Key Assumptions to Validate
- [ ] **Assumption 1 (Staple Ratio):** Users want most of their regular items to automatically reappear right after completing a trip, rather than starting from an empty screen.
- [ ] **Assumption 2 (Price Accuracy):** Last-purchased price (`$4.49`) is the best estimate for next week's estimated budget until updated at the store aisle.
- [ ] **Assumption 3 (One-Tap Usability):** An inline `⭐` icon on each `GroceryItemRow` is intuitive enough for users to distinguish usual items from one-offs without needing categories or separate tabs.

## MVP Scope
### In Scope
- Add `isEssential: boolean` (default `false`) to `GroceryItem` contract (`contracts.js`).
- Add an interactive star button (`⭐` / `☆`) to `GroceryItemRow.jsx` alongside the checkbox and inline edit controls.
- Add `toggleEssential({ id })` and `COMPLETE_TRIP` actions to `groceryReducer.js` and `GroceryContext.jsx`.
- Build a dedicated `CompleteTripModal.jsx` component that displays a detailed breakdown (`clearedCount`, `resetCount`, `remainingCount`) when completing a trip.
- Update `seedData.js` to showcase 4 essential items (`⭐ Organic Bananas`, `⭐ Milk`, `⭐ Eggs`, `⭐ Bread`) and 2 one-off items (`Avocados`, `Olive Oil`).

## Not Doing (and Why)
- **Multi-tab Master Template:** Removed previously; causes mental friction and double-entry when shopping.
- **Category Grouping:** Removed previously; slows down rapid item entry when building lists on the go.
- **Historical Price Trend Graphs:** Adds immense state complexity and visual clutter on mobile without helping the immediate in-store job.
- **Barcode Scanning / Store API Sync:** High technical overhead; store prices and availability vary wildly by specific location.

## Resolved Open Questions
- **Summary Notification:** Resolved: Yes, show a summary (`CompleteTripModal`) when the shopper taps **Complete Shopping Trip** to clearly show what resets vs what clears.
