# Changelog

All notable changes to the FreshTrack Grocery project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-10-22

### Added
- **Catalog ↔ List price sync**: Editing a staple's price updates its matching "To Buy" items, and setting a price on the list (e.g. *Mark on Cart*) saves it back as the staple's default. Items already "On Cart" keep the price confirmed at the store.
- **`catalogId` link**: List items added from the catalog remember their staple, so the link survives renames. Older and hand-typed items are matched by name.
- **"On list" badge** on catalog staples already on today's list, plus an "N on list" count.
- **Save receipt to phone (Android)**: *Download Receipt (PNG)* now saves into **Pictures/FreshTrack** (visible in Gallery / Files) via a native `FileSaver` plugin. A separate **Share** button keeps the share-sheet option.
- **Catalog import / export (CSV)**: Export your staples from the Catalog's **⋯** menu (saved to **Download/FreshTrack** on Android) and import a CSV back. Imports merge by name (new staples added, matching prices updated, nothing deleted) and show a summary to confirm first. Works with spreadsheet-edited files: optional header, `₱` / `PHP` prices, quoted names.

### Changed
- **Catalog page redesign** to match the List page: summary header, one-line search / Add Staple / Sort row, full-width divided rows, and a docked selection bar above the bottom nav.
- Tighter 16px side gutters on the header, List and Catalog pages.

### Fixed
- Catalog "Select all" now works correctly while a search is active.
- Catalog rows are reachable with the keyboard (Tab + Space).
- Removed catalog rows now play their exit animation.
- Receipt export on Android only opened the share sheet and never saved the image to the device.

## [Unreleased]

### Added
- **Frequently Bought Staples Catalog**: User-curated personal item catalog (`+ Add Catalog Item`) with search filtering (`CatalogView.jsx`).
- **Multi-Select Batch Adder**: Checkbox selection for instantly adding multiple staples to the daily list in one click (`Actions.batchAddToList`).
- **Sidebar & Hamburger Menu Navigation**: Slide-out navigation hub (`Sidebar.jsx`) for switching cleanly between `My Daily List` and `Staples Catalog`.
- **Offline Storage (`@capacitor/preferences`)**: Permanent native Android `SharedPreferences` storage (plus browser `localStorage` fallback) with automatic hydration on app start (`storage.js` & `GroceryContext.jsx`).
- **Capacitor Android Platform Support**: Configured `capacitor.config.json` (`com.freshtrack.grocery`) and initialized native Android directory (`android/`).
- **Automated GitHub Actions Release Pipeline (`release-android.yml`)**: Automates building web assets (`vite build`), syncing Capacitor (`cap sync android`), compiling the Android debug APK (`./gradlew assembleDebug`), extracting version from `package.json`, and publishing a GitHub Release complete with release notes and downloadable `.apk`.
- **Full-Screen Digital Receipt Pager**: Replaced small modal frame with a dedicated full-screen receipt pager featuring date + OS-safe time in PNG download filename (`DigitalReceiptModal.jsx`).

### Changed
- Refined `AddItemModal.jsx` layout to support dual tabs (`From Catalog` multi-select and `Manual Entry`).
- Streamlined item row controls: moved price input to the accordion/dropdown toggle alongside quantity stepper (`GroceryItemRow.jsx`).

## [0.1.0] - 2026-07-15
### Added
- Initial release of FreshTrack Grocery App with interactive item checklist, quantity tracking, price per piece calculation, and PNG digital receipt generator.
