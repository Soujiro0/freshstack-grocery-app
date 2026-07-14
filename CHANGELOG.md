# Changelog

All notable changes to the FreshTrack Grocery project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
