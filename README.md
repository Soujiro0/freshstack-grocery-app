<div align="center">

<img src="./public/logo.svg" width="140" height="140" alt="FreshTrack Logo" />

# FreshTrack - Grocery List & Staples Catalog Tracker

**Track Your Daily Groceries, Batch-Add Staples, and Generate Digital Receipts in Seconds.**

A fast, offline-first grocery tracking mobile & web application designed to eliminate paper lists and help you manage your everyday grocery shopping with zero friction.

</div>

---

## 🛑 The Problem

Shopping for groceries with generic notes apps or paper lists creates several recurring headaches:
1. **Repetitive Typing**: Every week, you buy the same core staples (*Bananas, Rice, Milk, Garlic*), yet you have to manually type or copy-paste them from scratch each time.
2. **Volatile Browser Storage**: Standard mobile web apps rely on basic `localStorage`. When your Android device runs low on memory or you clear your browser cache, your entire grocery list gets permanently wiped.
3. **No Price/Quantity Verification or Receipts**: Basic to-do apps don't calculate subtotals (`price per unit × quantity`) on the fly or provide a clean, downloadable proof-of-purchase receipt to verify against actual store checkouts.
4. **Tedious Mobile APK Builds**: Building and sharing standalone mobile Android APKs with family members or testers usually requires heavy local Android Studio setups and manual release uploading.

---

## 💡 Why Use FreshTrack?

FreshTrack solves these problems by combining modern web ergonomics with native Android offline persistence and automated CI/CD:

- **📚 Frequently Bought Staples Catalog**: Stop typing from scratch. Save your favorite everyday groceries into your personal **Staples Catalog** (`+ Add Catalog Item`). Use multi-select checkboxes (`[x]`) and our floating action bar to batch-add `X` staples to your Daily Checklist in a single click!
- **⚡ 100% Offline-First Native Storage (`@capacitor/preferences`)**: Built with Capacitor Preferences, your items and catalog are saved directly to native **Android SharedPreferences** (with a clean `localStorage` fallback on web). Your data is permanent, immune to browser cache sweeps, and instantly available offline.
- **🧾 Full-Screen Digital Receipt Generator**: When you finish shopping, click **Generate Digital Receipt** to transition into a clean, borderless full-screen pager. Verify all checked items, quantities, and totals, then download a timestamp-exact PNG image (`FreshTrack_Receipt_YYYY-MM-DD_HH-mm-ss.png`) straight to your device.
- **📱 Dual-Mode Add Modal**: Whether you are browsing your existing staples (`From Catalog` tab) or entering a one-off item with quantity steppers (`Manual Entry` tab), adding items takes just seconds.
- **🤖 Automated GitHub Android APK Releases**: Integrated with GitHub Actions (`release-android.yml`). Push a semantic version tag (`v*`), and GitHub automatically compiles the web bundle, syncs Capacitor, runs Gradle to build `app-debug.apk`, reads `CHANGELOG.md`, and publishes an official GitHub Release with the downloadable APK attached!

---

## 🔗 Links & Documentation

- **Changelog**: [View CHANGELOG.md](CHANGELOG.md) — *Detailed release notes and version history (`v0.1.0`).*
- **Architecture & ADRs**: [Offline Storage & Release Workflow One-Pager](docs/ideas/offline-storage-and-github-release.md) — *Technical breakdown of our Capacitor SharedPreferences storage and CI/CD decisions.*
- **Package Contract**: [package.json](package.json) — *Single source of truth for app versioning (`0.1.0`) and dependencies.*

---

## 🛠️ How to Use & Get Started

### 1. Running Locally (Web Dev Server)
Prerequisites: **Node.js 22+** (Required by Capacitor 8 CLI)
```bash
# Clone or open the project repository
cd grocery-list-app

# Install dependencies
npm ci

# Start the lightning-fast Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`. Use the top hamburger navigation menu (`Menu`) to slide between **My Daily List** and the **Staples Catalog Hub**.

### 2. Building & Testing Android APK Locally
Prerequisites: **Java JDK 17+** and **Android SDK** (or Android Studio)
```bash
# 1. Build the production web bundle
npm run build

# 2. Sync web assets & preferences plugin to the native Android folder
npx cap sync android

# 3. Compile the standalone debug APK using Gradle
cd android
./gradlew assembleDebug

# Your ready-to-install APK will be generated at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Publishing an Automated Android APK Release on GitHub
Our workflow (`.github/workflows/release-android.yml`) requires **no manual version bumping locally** beyond updating `package.json` (`version: "0.1.0"`).

To trigger a new automated APK release:
```bash
# 1. Ensure your version in package.json and CHANGELOG.md is up to date
git add .
git commit -m "chore: release v0.1.0"
git push origin main

# 2. Create and push a git tag matching the package.json version
git tag v0.1.0
git push origin v0.1.0
```
Within minutes, GitHub Actions will:
1. Build the frontend assets and sync Capacitor (`npx cap sync android`).
2. Run Gradle to compile `app-debug.apk`.
3. Extract the exact version directly from `package.json` and release notes from `CHANGELOG.md`.
4. Publish a official GitHub Release complete with the downloadable `.apk` asset!

---

## 🧰 Tech Stack & Architecture

- **Core Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Mobile Bridge & Storage**: [Capacitor 8](https://capacitorjs.com/) (`@capacitor/core`, `@capacitor/preferences`, `@capacitor/android`)
- **Image Generation**: [`html-to-image`](https://github.com/bubkoo/html-to-image) for high-fidelity PNG digital receipts
- **Linting & Quality**: [Oxlint](https://oxc.rs/) (`npm run lint`)
- **CI/CD Automation**: GitHub Actions (`softprops/action-gh-release@v2`)

---

<div align="center">
  <sub>Built with ❤️ following advanced UI engineering and architecture standards.</sub>
</div>
