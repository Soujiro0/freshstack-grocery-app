# Idea Refine: Offline Capacitor Storage & GitHub Release APK Workflow

## Problem Statement
**How Might We** permanently save the shopper's checklist and staples catalog across mobile app restarts on Android without losing data to webview cache eviction, while also automating the build and distribution of Android APK releases on GitHub whenever a new version is tagged?

---

## Recommended Direction: `@capacitor/preferences` + Automated GitHub APK Releases

Based on our evaluation and your answers, we will combine native Android SharedPreferences storage with a fully automated CI/CD release pipeline.

### Pillar 1: Permanent Offline Storage (`@capacitor/preferences`)
- **Native Android SharedPreferences**: Unlike pure browser `localStorage` (which mobile OS memory managers can wipe when storage is low), `@capacitor/preferences` stores our `GroceryState` (`{ items: [], catalog: [] }`) natively in Android `SharedPreferences`. On web browsers, it gracefully falls back to `localStorage`.
- **Automatic Hydration & Persistence (`GroceryContext.jsx` + `storage.js`)**:
  - On application startup, the app loads saved state from `Preferences.get({ key: 'freshtrack_state' })`.
  - Whenever the user adds, toggles, or deletes an item or catalog staple, `useEffect` triggers `Preferences.set({ key: 'freshtrack_state', value: JSON.stringify(state) })`.
  - Zero latency, 100% offline-ready, and survives app updates and reboots.

### Pillar 2: Capacitor Android Platform Setup (`@capacitor/android`)
- Initialize `capacitor.config.json` (`appId: "com.freshtrack.grocery"`, `appName: "FreshTrack"`).
- Run `npx cap add android` to generate the native Android project folder (`android/`).

### Pillar 3: Automated Release Workflow (`.github/workflows/release-android.yml`)
- **Triggers**: On pushing git tags starting with `v` (`v*`) e.g. `git tag v0.1.0 && git push --tags`, plus `workflow_dispatch` for manual on-demand triggers.
- **Build Steps**:
  1. Setup Node.js 20 & Java JDK 17 (required for Gradle/Android compilation).
  2. `npm ci && npm run build` (produces Vite `dist/` bundle).
  3. `npx cap sync android` (copies web bundle + plugins into `android/app/src/main/assets/public`).
  4. Run `./gradlew assembleDebug` (compiles `app-debug.apk`).
- **Version Bumping & Changelog Integration (`package.json` + `CHANGELOG.md`)**:
  - Version dynamically extracted directly from `package.json` (`jq -r .version package.json`). No manual tag-to-version guessing required.
  - Reads notes from `CHANGELOG.md` to populate the GitHub Release body automatically.
  - Uploads `app-debug.apk` (and/or release APK) directly to the GitHub Release page so testers and users can download and install instantly.

---

## Key Assumptions to Validate
- [ ] **Assumption 1**: JSON serialization/deserialization inside `@capacitor/preferences` takes `< 10ms` for our payload, making storage writes completely unnoticeable during typing or rapid toggling.
- [ ] **Assumption 2**: GitHub Actions `ubuntu-latest` runners with JDK 17 can compile `./gradlew assembleDebug` without needing custom Android SDK license pre-acceptance steps (`setup-android` Action handles SDK setup automatically).

---

## MVP Scope
### In Scope
- Install and configure `@capacitor/core`, `@capacitor/cli`, `@capacitor/preferences`, `@capacitor/android`.
- Create `src/utils/storage.js` (`loadState`, `saveState`).
- Modify `GroceryContext.jsx` to load from SharedPreferences on mount and auto-save on state changes.
- Create `CHANGELOG.md` at project root with Keep a Changelog structure.
- Create `.github/workflows/release-android.yml` to build web, sync Capacitor, run Gradle, read `CHANGELOG.md`, and publish GitHub Release with APK.

### Not Doing (and Why)
- **No SQLite or SQL Database Migration Setup** — *Reason*: Our payload is under 100 KB. SharedPreferences/key-value storage is 10x simpler, zero-schema, and immune to SQL locking bugs on mobile threads.
- **No Keystore Production Signing in MVP Workflow** — *Reason*: Generating and safeguarding a secret GPG/JKS keystore inside GitHub Actions Secrets is an optional follow-up step once app store publishing (`Google Play Store`) is ready. For now, `assembleDebug` generates an immediately installable APK (`app-debug.apk`) across all Android devices for testing and direct distribution.
