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

## Continuous delivery with GitHub Actions

Repository: https://github.com/advdk/alderman

| Workflow | Trigger | What it does |
|---|---|---|
| **Play release** (`play-release.yml`) | push a tag `v1.2.3`, or run by hand | web build → `cap sync` → signed `.aab` (versionName `1.2.3`, versionCode `10203`) → uploads to **internal testing** → GitHub release with the `.aab` attached |
| **Play promote** (`play-promote.yml`) | run by hand | `promote` internal → alpha (closed testing) → production as a staged rollout · `rollout` to raise the percentage (100 finishes it) · `halt` · `status` |

Release notes come from `store/whatsnew/en-GB.txt` (max 500 characters; add `da-DK.txt` etc. for more languages).
The same script works from your PC: `npm run play -- status` (after `gcloud auth application-default login`).

### How the pipeline signs in to Google (no keys stored)
GitHub logs in to Google Cloud with **Workload Identity Federation**: the pool `github` / provider
`github-actions` in project `alderman-2026` trusts only jobs from `advdk/alderman` running in the
GitHub environment **google-play**, and lets them act as `play-publisher@alderman-2026.iam.gserviceaccount.com`.
No JSON key exists. The Android Publisher, IAM Credentials and STS APIs are enabled. ✅

### One-time setup
1. 👤 Move the workflows into place (the remote tools may not write into `.github`), then push:
   ```
   New-Item -ItemType Directory -Force .github\workflows | Out-Null
   Move-Item tools\ci\*.yml .github\workflows\
   git add -A; git commit -m "Add Google Play workflows"; git push
   ```
2. 👤 GitHub → Settings → Environments → **New environment** `google-play`.
   Recommended: under *Deployment branches and tags*, allow only tags `v*` and `main`, and add yourself as required reviewer
   if you want to approve each upload.
3. 👤 In that environment add **variables**:
   - `GCP_WORKLOAD_IDENTITY_PROVIDER` = `projects/1088268196528/locations/global/workloadIdentityPools/github/providers/github-actions`
   - `GCP_SERVICE_ACCOUNT` = `play-publisher@alderman-2026.iam.gserviceaccount.com`
4. 👤 After `tools\make-upload-key.ps1`, add the **secrets** `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`,
   `ANDROID_KEY_PASSWORD`: run `powershell -ExecutionPolicy Bypass -File tools\copy-ci-secrets.ps1`, which puts each
   value on your clipboard in turn.
5. 👤 Play Console → **Users and permissions** → Invite new users → `play-publisher@alderman-2026.iam.gserviceaccount.com`
   → App permissions → Alderman: *Release apps to testing tracks*, *Manage testing tracks and edit tester lists*,
   *Release to production, exclude devices, and use Play App Signing*.

### The very first upload
Google Play accepts API uploads only after the app has one bundle uploaded by hand. So:
1. Tag the first version: `git tag v1.0.0; git push origin v1.0.0`.
2. The build and signing succeed. The upload step fails with "package not found": expected this one time.
3. Download the `.aab` from the run's **Artifacts** and upload it in Play Console → Internal testing.
4. Until the app has been reviewed and published once, API releases must be drafts:
   run **Play release** by hand with status `draft`, or wait until after the first review.

### A normal release afterwards
1. Raise `version` in `package.json` (e.g. `1.0.1`) and update `store/whatsnew/en-GB.txt`; commit.
2. `git tag v1.0.1; git push origin main v1.0.1` → it lands in internal testing within about 10 minutes.
3. Test it, then **Play promote** → `promote` internal → alpha, and later alpha → production at 20 %.
4. **Play promote** → `rollout` 50, then 100. If Android vitals look bad: `halt`.
