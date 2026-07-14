# Idea Refine: Frequently Bought Item Catalog

## Problem Statement
**How Might We** enable shoppers to effortlessly manage and select from a personal catalog of frequently bought grocery staples, so they can batch-add items to their daily checklist in seconds without repetitive manual typing?

---

## Recommended Direction: The User-Curated Catalog & Sidebar Hub

Based on our divergent exploration and your feedback, we will implement a clean, multi-view architecture centering around a **Personal Item Catalog** accessible via a header hamburger menu and sidebar drawer.

### Key Architectural Pillars:
1. **Hamburger Navigation & Sidebar Drawer (`Layout.jsx` + `Sidebar.jsx`)**
   - A crisp hamburger icon (`Menu`) in the top navigation bar opens a slide-out drawer (`Sidebar`).
   - Enables seamless switching between **`My Daily List`** (active checklist) and **`Item Catalog`** (personal item repository).

2. **Dedicated Catalog Page (`CatalogView.jsx`)**
   - **Search Bar**: Instant real-time filtering (`Search catalog staples...`).
   - **Catalog Management (`+ Add Catalog Item`)**: Users manually input and manage their own frequently bought items (`Name`, optional default `Price / Pcs`).
   - **Multi-Select Batch Adder**: Each catalog item has a selection checkbox (`[x]`). Selecting multiple items displays a floating action bar: **`Add X Items to My Daily List`** (`Actions.addMultipleItems`).

3. **Dual-Mode Add Button (`AddItemModal.jsx`)**
   - Clicking **`+ Add Item`** on the main Daily List view presents two clear choices in a tabbed or toggle modal:
     - **`Select from Catalog`** (multi-select picker to quickly check off staples and batch-add).
     - **`Add Custom Item Manually`** (quick single-item input with name & quantity).

---

## Key Assumptions to Validate
- [ ] **Assumption 1**: Users prefer managing their own exact list of staples ("just manually inputted") over automatic background guessing/history tracking.
  - *Validation*: Verify that adding/editing catalog items is under 2 clicks and feels lightning fast.
- [ ] **Assumption 2**: Multi-select batch adding (e.g., checking off 6 items at once) saves significant time compared to single-item modals.
  - *Validation*: Test the floating multi-select bar across desktop and mobile screen widths.
- [ ] **Assumption 3**: A sidebar navigation pattern keeps the main checklist clean without cluttering the header.
  - *Validation*: Ensure the drawer slides smoothly (`animate-slideRight`) and closes on backdrop click or Escape press.

---

## MVP Scope (What's In vs. What's Out)

### In Scope (MVP)
- **State Store Extension (`GroceryContext.jsx` & `groceryReducer.js`)**:
  - `state.catalog`: Array of user-managed catalog items (`[{ id, name, defaultPrice: number }]`).
  - `ADD_TO_CATALOG`, `REMOVE_FROM_CATALOG`, `BATCH_ADD_TO_LIST` action types.
- **Header & Sidebar (`Sidebar.jsx`)**: Slide-out navigation menu for switching views (`activeTab: 'list' | 'catalog'`).
- **`CatalogView.jsx` Page**: Search input, list of catalog items with checkboxes, floating `Add X Selected to List` button, and `+ Add New Catalog Item` modal.
- **Enhanced `AddItemModal.jsx`**: Dual tabs (`From Catalog` vs. `Manual Entry`).

---

## Not Doing (and Why)
- **No Automatic AI History Scraping** — *Reason*: Users specified they want full control ("just manually inputted"). Auto-adding items from every one-off purchase clutters the catalog with items they may only buy once a year.
- **No Multi-Level Sub-Categories or Nested Folders** — *Reason*: Simplicity is the ultimate sophistication. A fast search bar and clean flat list are 10x faster to scan and maintain than navigating complex tree hierarchies while shopping.
- **No External Database Sync** — *Reason*: Keeps the app instant, offline-capable, and zero-latency using local storage persistence.

---

## Open Questions for Implementation
1. Would you like us to seed the initial catalog with **10–15 common Philippine grocery staples** (e.g., *Rice, Garlic, Onions, Eggs, Cooking Oil, Soy Sauce, Whole Milk*) right off the bat so new users aren't starting with a completely empty catalog?
2. Should deleting an item from the `Item Catalog` also remove it from the `My Daily List` if it's currently on the checklist, or should the daily list remain independent once added? *(Recommendation: Keep daily list items independent once added).*
