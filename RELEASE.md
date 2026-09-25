# Alderman — Google Play release checklist

Status of `google_play_publishing.md`, applied to this project. ✅ done · 👤 needs you · ⏳ after a 👤 step

App: **Alderman: Hanseatic Trade** · package **com.midnightsyntaxlabs.alderman** · version **1.0.0 (1)** · target API **36**
(Google Play has required API 36 for new apps and updates since 31 August 2026.)

## Phase 0: cleanup and Android wrapper
- ✅ Release build `npm run build` → `www/`: music and stings re-encoded to 96 kbps (27.3 MB → 15.4 MB), version stamped.
- ✅ Fonts are bundled (no Google Fonts requests), so the app works offline.
- ✅ Developer tools (test pace, console helpers, emulator hooks) are off in the Android app and on the live site.
- ✅ Production Firebase only; emulators need `?emu` on localhost and never apply to the app.
- ✅ Capacitor 8 wrapper in `android/`. Portrait only, HTTPS only (`usesCleartextTraffic="false"`),
  permissions: INTERNET, ACCESS_NETWORK_STATE, POST_NOTIFICATIONS (exact alarms removed).
- ✅ Launcher icons (adaptive), splash screens, notification icon.
- ✅ Android glue (`public/js/native.js`): local notifications for arrivals and news, the back button,
  pausing and resuming, and native Google sign-in.
- ✅ In-app **Settings → Delete my data** (a Play requirement for apps with accounts).
- 👤 Delete the empty `Sound` folder and `firestore-debug.log` (I can't delete files on your PC).

## Phase 1: Firebase and the build
- ✅ Firebase Android app registered for `com.midnightsyntaxlabs.alderman`; `android/app/google-services.json` downloaded.
- ✅ Debug key fingerprints (SHA-1 and SHA-256) added to Firebase; debug APK builds.
- 👤 **Create the upload key.** Run this yourself, once, and choose a password:
  `powershell -ExecutionPolicy Bypass -File tools\make-upload-key.ps1`
  Then put the password and a copy of `%USERPROFILE%\.android-keys\alderman-upload.jks` in your password manager.
- ⏳ Claude: add the upload key's SHA fingerprints to Firebase, then build the signed bundle with
  `npm run android:bundle` → `android/app/build/outputs/bundle/release/app-release.aab`.

## Phase 2: Play Console app and store assets
- 👤 Play Console → Create app: name **Alderman: Hanseatic Trade**, Game, English (UK), Free.
- ✅ Text ready in `store/listing.md` (short description, full description, release notes).
- ✅ Graphics in `store/`: `icon-512.png`, `feature-graphic.png` (1024 × 500), six phone screenshots (1080 × 1920).

## Phase 3: Play App Signing and Firebase
- 👤 After the first upload: Play Console → Test and release → App integrity → App signing →
  copy the **App signing key** SHA-1 and SHA-256.
- ⏳ Claude adds them: `firebase apps:android:sha:create 1:1088268196528:android:fc3e0c8f18febd21b53975 <SHA>`,
  re-downloads `google-services.json` and rebuilds. Without this step, "Link Google account" fails in store builds.

## Phase 4: App content
- ✅ Privacy policy live: https://alderman-2026.web.app/privacy.html (includes deletion instructions at `#delete`).
- ✅ Every answer is in `store/app-content.md`: data safety, ads (none), app access, content rating, target audience (13+).
- 👤 Enter them in Play Console → App content.

## Phase 5: Testing
- 👤 Internal testing: upload the `.aab`, add yourself and up to 100 testers.
  Check: first start, naming the house, sound, notifications permission, cloud copy, Google link, leaderboard.
- 👤 Closed testing: for a **personal** developer account (made after Nov 2023), at least **12 testers must stay opted in for 14 days**
  before you can apply for production. Organisation accounts are exempt.

## Phase 6: Production
- 👤 Production → Create release → upload the `.aab` → release notes → staged rollout at 10–20 %.
- 👤 Watch Android vitals. There is no Crashlytics (it's not in the Data safety form); if you add it,
  update `store/app-content.md` and the privacy policy first.

## Each new version
1. Raise `version` and `androidVersionCode` in `package.json` (the code must always go up).
2. `npm run deploy` (website) and `npm run android:bundle` (Play), then upload the `.aab`.
