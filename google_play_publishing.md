# Google Play Store Publishing Guide (Firebase Game Integration)

We need to publish to [Google Play Console](https://play.google.com/console). In order to do so, follow this step-by-step checklist to prepare, build, and release your Firebase-backed game.

## Quick Navigation

1. [Phase 0: Pre-Release Project Cleanup & Android Wrapper](#phase-0-pre-release-project-cleanup--android-wrapper)

2. [Phase 1: Firebase & Build Preparation](#phase-1-firebase--build-preparation)

3. [Phase 2: Play Console App Creation & Visual Assets](#phase-2-play-console-app-creation--visual-assets)

4. [Phase 3: Critical Firebase & Play App Signing Linkage](#phase-3-critical-firebase--play-app-signing-linkage)

5. [Phase 4: Policy Declarations & Data Safety](#phase-4-policy-declarations--data-safety)

6. [Phase 5: Testing Tracks & Quality Gates](#phase-5-testing-tracks--quality-gates)

7. [Phase 6: Production Release & Staged Rollout](#phase-6-production-release--staged-rollout)

---

## Phase 0: Pre-Release Project Cleanup & Android Wrapper

* \[ \] **Clean Up the Project**
  * Audit codebase for unused assets, debug logs, leftover test scripts, and uncompressed raw media files.
  * Verify that all game resources (textures, audio files, pre-rendered scenes) are compressed for mobile target performance.
  * Clear local build caches, temp folders, and target directory outputs before building final artifacts.

* \[ \] **Remove Developer-Related Temp Configurations**
  * Disable debug/cheat consoles, developer menus, and staging/test UI elements.
  * Switch environment variables from local/staging servers to production Firebase environments (e.g., disable Firebase Emulators).
  * Ensure logging flags (e.g., `Log.d` / verbose logging) are disabled for production releases.
  * Strip staging credentials, dummy API tokens, and hardcoded test user profiles.

* \[ \] **Create & Configure the Android Wrapper**
  * Set up the native Android shell/wrapper project (e.g., Capacitor, Cordova, WebView, or Unity/Unreal native Android export).
  * Configure `AndroidManifest.xml`:
    * Set required permissions (e.g., `INTERNET`, `ACCESS_NETWORK_STATE`, `VIBRATE`).
    * Verify `android:usesCleartextTraffic="false"` to enforce HTTPS connections.
    * Set orientation rules (`android:screenOrientation="landscape"` or `"portrait"`).
  * Update `build.gradle` (or `build.gradle.kts`):
    * Define `applicationId` (e.g., `com.yourcompany.gamename`).
    * Increment `versionCode` (integer, e.g., `1`) and update `versionName` (string, e.g., `"1.0.0"`).
    * Set target SDK to the latest required version (Android 15 / API level 35+).

---

## Phase 1: Firebase & Build Preparation

* \[ \] **Verify Android Package Name**
  * Ensure the `applicationId` in your Android wrapper matches the Android App entry in your **Firebase Console**.

* \[ \] **Download Fresh Configuration**
  * Download the latest `google-services.json` from **Firebase Console** $\rightarrow$ **Project Settings** $\rightarrow$ **Your Apps**.
  * Place it in your project's `app/` directory (or equivalent path depending on your engine/framework wrapper).

* \[ \] **Generate Production Android App Bundle (`.aab`)**
  * Google Play requires the `.aab` format for all new releases.
  * Target the required API level (Android 15 / API Level 35+).
  * Sign the bundle with your **Release Keystore**.
  * Keep your keystore file and passwords stored safely in a secure password manager. Loss of this key prevents future app updates.

---

## Phase 2: Play Console App Creation & Visual Assets

* \[ \] **Create App Entry**
  1. Open [Google Play Console](https://play.google.com/console).
  2. Click **Create app**.
  3. Enter the **App Name** (max 30 characters).
  4. Select **Game** as the App/Game type.
  5. Select default language and whether the app is **Free** or **Paid**.

* \[ \] **Prepare Store Listing Info**
  * **Short description:** Up to 80 characters.
  * **Full description:** Up to 4,000 characters.

* \[ \] **Prepare Visual Assets**
  * **App Icon:** $512 \times 512$ px, 32-bit PNG with alpha, max 1 MB.
  * **Feature Graphic:** $1024 \times 500$ px, JPG or 24-bit PNG (no alpha), max 15 MB.
  * **Phone Screenshots:** Minimum 2 screenshots (aspect ratio 16:9 or 9:16, between 320px and 3840px per side).
  * **7-inch / 10-inch Tablet Screenshots (Optional but recommended):** Improves visibility on tablet devices.

---

## Phase 3: Critical Firebase & Play App Signing Linkage

> **Important:** Google Play App Signing re-signs your app bundle with a Google-managed key upon release. If you do not register this Google key's SHA fingerprints in Firebase, features like Google Sign-In, Phone Auth, and Dynamic Links will break in live Play Store builds.

1. **Obtain Fingerprints from Play Console**
   * Go to **Play Console** $\rightarrow$ **Setup** $\rightarrow$ **App Integrity** $\rightarrow$ **App Signing**.
   * Copy both the **SHA-1 certificate fingerprint** and **SHA-256 certificate fingerprint** under the **App signing key certificate** section.

2. **Add Fingerprints to Firebase**
   * Go to **Firebase Console** $\rightarrow$ **Project Settings** $\rightarrow$ **General**.
   * Scroll down to **Your Apps** $\rightarrow$ **Android app**.
   * Click **Add fingerprint** and paste the **SHA-1** from Play Console.
   * Repeat the step for the **SHA-256** fingerprint.

3. **Re-download `google-services.json`**
   * If using OAuth or Google Sign-In, re-download `google-services.json` and replace it in your project to ensure client ID configurations match.

---

## Phase 4: Policy Declarations & Data Safety

Navigate to **Play Console** $\rightarrow$ **App content** and complete each mandatory section:

### 1. Data Safety Form (Firebase Mapping)

Declare the data collected by your Firebase SDKs:

| Firebase SDK | Data Type Collected | Purpose | Shared / Collected |
| ----- | ----- | ----- | ----- |
| **Firebase Analytics** | User identifiers, Device IDs, App interactions | Analytics, Personalization | Collected |
| **Firebase Crashlytics** | Crash logs, Diagnostics, Device performance | App functionality, Analytics | Collected |
| **Firebase Authentication** | Email address, Phone number, UID | Account management, Authentication | Collected |
| **Cloud Firestore / Realtime DB** | Custom user/game data | App functionality | Collected |

### 2. Privacy Policy

* Provide an active HTTPS URL containing your Privacy Policy disclosing data collection via Firebase.

### 3. Additional Declarations

* \[ \] **Ads Declaration:** Declare whether your game contains ads (e.g., AdMob).
* \[ \] **App Access:** State if parts of your game require login credentials (provide demo credentials for review if applicable).
* \[ \] **Content Rating:** Complete the IARC questionnaire to receive regional content ratings (ESRB, PEGI, etc.).
* \[ \] **Target Audience & Content:** Specify age categories. Games targeting children under 13 require adherence to Google's Designed for Families policy.

---

## Phase 5: Testing Tracks & Quality Gates

### 1. Internal Testing Track

* Upload your `.aab` to **Testing** $\rightarrow$ **Internal testing**.
* Add up to 100 internal testers (via email list).
* Use this track to instantly test Firebase connectivity, database read/writes, and authentication on real hardware without waiting for full Google reviews.

### 2. Closed Testing Gate (Personal Accounts)

* **Note:** Personal Developer Accounts registered after November 2023 require **at least 12 opted-in testers** to participate in a **closed test continuously for 14 days** before public production access is granted.
* Organization accounts can skip the mandatory 14-day rule, though a closed test is still recommended.

---

## Phase 6: Production Release & Staged Rollout

1. **Create Production Release**
   * Go to **Release** $\rightarrow$ **Production** $\rightarrow$ **Create new release**.
   * Upload your signed production `.aab`.
   * Fill out the **Release Notes** for players.

2. **Configure Staged Rollout**
   * Select a staged rollout percentage (e.g., **10%** or **20%**).
   * Submit the release for review.

3. **Post-Launch Monitoring**
   * Monitor **Firebase Crashlytics** and **Play Console Android Vitals** during early rollout.
   * If crashes or critical errors spikes are detected, pause the rollout, deploy a bugfix `.aab`, and resume.
   * Increase rollout to 100% once stability is verified.