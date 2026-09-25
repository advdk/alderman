# Playbook: from web game to Google Play

How Alderman went from a single HTML prototype to a Firebase-hosted web game, an Android app on
Google Play, and a GitHub Actions release pipeline. Written so the next Midnight Syntax Labs game can
follow the same path in a day instead of a week. The Alderman repo is the reference implementation:
copy files from it rather than starting from scratch.

Reference repo: https://github.com/advdk/alderman

---

## 0. Fill in this table first

Every command below uses these values. Choose them before you start; the package name can **never** change.

| Value | Alderman | Next game |
|---|---|---|
| Game name (store, max 30 chars) | Alderman: Hanseatic Trade | |
| Short name | Alderman | |
| GitHub repo | advdk/alderman | advdk/`<game>` |
| Firebase / Google Cloud project ID | alderman-2026 | `<game>-2026` |
| Firebase project number | 1088268196528 | (from `firebase projects:list`) |
| Android package name | com.midnightsyntaxlabs.alderman | com.midnightsyntaxlabs.`<game>` |
| Firebase web app ID | 1:1088268196528:web:d36c… | |
| Firebase Android app ID | 1:1088268196528:android:fc3e0c8f18febd21b53975 | |
| Play publisher service account | play-publisher@alderman-2026.iam.gserviceaccount.com | play-publisher@`<project>`.iam.gserviceaccount.com |
| Store contact email | midnightsyntaxlabs@gmail.com | |
| Privacy policy URL | https://alderman-2026.web.app/privacy.html | |

**Who does what:** 👤 = you, in a browser or with a password. 🤖 = Claude or a script. Google doesn't
allow some steps to be automated (creating the Play app, first upload, App content forms, passwords).

---

## 1. Project layout (copy from Alderman)

```
<game>/
├─ public/                 the game (HTML/CSS/JS), served as-is in development
│  ├─ index.html, css/, js/game.js, js/native.js, vendor/, fonts/, audio/, privacy.html
├─ tools/                 reusable as-is in the next game (see tools/README.md)
│  ├─ build.mjs            public/ -> www/ (compress audio, stamp version)
│  ├─ firebase-entry.js    which Firebase SDK parts to bundle -> public/vendor/firebase.js
│  ├─ play.mjs             Google Play API: upload, promote, rollout, halt, status, listing
│  ├─ make-upload-key.ps1  creates the Play upload key (you run it; it asks for a password)
│  ├─ copy-ci-secrets.ps1  puts the signing secrets on your clipboard for GitHub
│  ├─ rules.test.mjs       Firestore security rules tests
│  └─ ci/                  workflow templates: copy to .github/workflows/
├─ android/                Capacitor project (committed)
├─ assets/                 icon/splash sources for @capacitor/assets
├─ store/                  listing.md, app-content.md, whatsnew/en-GB.txt, icon, feature graphic, screenshots
├─ website-kit/            images + docs + privacy page for the company website
├─ .github/workflows/      play-release.yml, play-promote.yml
├─ capacitor.config.json, firebase.json, firestore.rules, package.json, RELEASE.md
```

**The `tools/` folder is game-agnostic:** copy it whole. It reads the game's name from `package.json`
(`name`) and the package name from `capacitor.config.json` (`appId`). Copy `tools/ci/*.yml` to
`.github/workflows/` unchanged. Then search-and-replace the table values in:
`capacitor.config.json`, `firebase.json`, `firestore.rules`, `package.json` (name, scripts, devDependencies),
`android/app/build.gradle` (version + signing blocks), `android/variables.gradle` (Google sign-in lines),
`android/app/src/main/AndroidManifest.xml` (permissions, portrait, cleartext off), `public/js/native.js`.

---

## 2. Git

### First time

```powershell
cd C:\Home\dev\<game>
git init -b main
git add -A
git commit -m "Initial import"
git remote add origin https://github.com/advdk/<game>.git     # 👤 create the empty repo on GitHub first
git push -u origin main
```

Check `.gitignore` before the first commit. It must contain at least:

```
node_modules/  www/  .cache/  .firebase/  release/  *.aab  *.apk  *.jks  *.keystore
android/keystore.properties  android/local.properties  android/app/build/  android/build/  android/.gradle/
firestore-debug.log  firebase-debug.log*  *.log  play-service-account*.json
```

`google-services.json` **is** committed (it isn't secret). The keystore and its passwords never are.

### Day to day

- Work on `main` (small team). Use a branch plus a pull request when you want review:
  `git switch -c feature/x` … `git push -u origin feature/x`.
- Commit messages: one summary line, a blank line, then why.
- **A release is a tag.** The tag must equal `version` in `package.json`:

```powershell
# bump "version" in package.json (e.g. 1.0.1) and update store/whatsnew/en-GB.txt, then:
git commit -am "Release 1.0.1"
git tag v1.0.1
git push origin main v1.0.1        # -> GitHub Actions builds, signs and uploads to Play internal testing
```

- Version code is derived from the tag: `v1.2.3` → `10203` (major×10000 + minor×100 + patch).
  It always increases as long as the tags do. Minor and patch must stay below 100.

---

## 3. Web game on Firebase

```powershell
firebase projects:create <game>-2026 --display-name "<Game>"
firebase use <game>-2026 --alias default
firebase apps:create WEB "<Game> Web"
firebase apps:sdkconfig WEB <webAppId>                      # paste into FIREBASE_CONFIG in game.js
gcloud services enable firestore.googleapis.com identitytoolkit.googleapis.com --project <game>-2026
firebase firestore:databases:create "(default)" --location eur3
npm install --include=dev                                    # see gotcha 1
npm run build:firebase                                       # bundles the Firebase SDK subset
npm run build                                                # public/ -> www/
firebase deploy --only hosting,firestore,auth                # auth providers come from firebase.json
```

- Test channel: `firebase hosting:channel:deploy preview --expires 7d`.
- Rules tests: `npm run test:rules` (needs Java).

What Alderman's web layer includes and the next game should too:
- anonymous sign-in, an optional "Link Google account", and a cloud save;
- a save version with upgrade steps;
- a leaderboard whose server-side rules check claimed game time against the server clock;
- a name filter;
- "Delete my data" in Settings, which Google Play requires for apps with accounts;
- self-hosted fonts, so the app works offline and no Google Fonts requests are made;
- developer tools only when `DEV` is on (localhost or `?dev`, never inside the app).

---

## 4. Android app (Capacitor 8)

### One-time on a new PC
- Android command-line tools in `%LOCALAPPDATA%\Android\Sdk` with `platform-tools`, `platforms;android-36` and `build-tools;36.0.0`
  (`sdkmanager --licenses`, then install). You don't need Android Studio.
- Java 21 (Temurin). `android/local.properties` must contain `sdk.dir=C:\\Users\\<you>\\AppData\\Local\\Android\\Sdk`.

### Create the wrapper

```powershell
npm install @capacitor/core @capacitor/android @capacitor/app @capacitor/local-notifications @capacitor/splash-screen @capacitor-firebase/authentication
npm install -D @capacitor/cli @capacitor/assets
# capacitor.config.json: appId = package name, webDir = www   (copy Alderman's)
npx cap add android
npx capacitor-assets generate --android --iconBackgroundColor "#1c2a2c" --splashBackgroundColor "#1c2a2c"
```

Then apply Alderman's edits:
- **AndroidManifest:** portrait, `usesCleartextTraffic="false"`, `POST_NOTIFICATIONS`, and remove `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM` with `tools:node="remove"` (otherwise Play asks for an exact-alarm declaration).
- **app/build.gradle:** version from package.json or `APP_VERSION_NAME` / `APP_VERSION_CODE` (set by CI from the tag), and signing from `keystore.properties` or environment variables. The key alias defaults to `<package.json name>-upload`.
- **variables.gradle:** `rgcfaIncludeGoogle = true` (native Google sign-in).
- Target and compile SDK **36**: Google Play has required API 36 for new apps and updates since 31 Aug 2026. Check the current rule each year.

### Firebase Android app and fingerprints

```powershell
firebase apps:create ANDROID "<Game> Android" --package-name com.midnightsyntaxlabs.<game>
# debug key (after the first debug build):
keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android
firebase apps:android:sha:create <androidAppId> <SHA1 without colons>
firebase apps:android:sha:create <androidAppId> <SHA256 without colons>
firebase apps:sdkconfig ANDROID <androidAppId>  > android\app\google-services.json   # see gotcha 7
```

Three keys get registered this way, each with SHA-1 and SHA-256:
1. the **debug** key;
2. the **upload** key (step 5);
3. **Google's app signing key** (step 6).

Without number 3, Google sign-in fails in store builds.

### Builds

```powershell
npm run android:apk-debug      # sideload test build
npm run android:bundle         # signed .aab (needs android/keystore.properties)
```

---

## 5. Upload key 👤

```powershell
powershell -ExecutionPolicy Bypass -File tools\make-upload-key.ps1
```

- Asks for a password and creates `%USERPROFILE%\.android-keys\<name>-upload.jks` (name from package.json) plus `android/keystore.properties`.
- Store the password and a copy of the `.jks` in the password manager.
- Get the upload key fingerprints without the password: `keytool -printcert -jarfile release\<game>-1.0.0.aab`.
- Register both fingerprints in Firebase (step 4).

---

## 6. Google Play Console 👤 (in order)

1. **Create app:** name, Game, default language, Free. Google offers no API or command-line tool for this step.
2. **Internal testing → Create release:** keep Google-managed app signing and upload the first `.aab` **by hand**. This sets the package name; before it, no API can reach the app.
3. **App signing fingerprints:** left menu → *Protected with Play* → *Play Store protection* → *Manage Play app signing*
   (or search "app signing"). Copy the **App signing key certificate** SHA-1 and SHA-256, **not** the
   upload key block, and give them to Claude to register in Firebase.
4. **Users and permissions → invite** `play-publisher@<project>.iam.gserviceaccount.com`:
   *Release apps to testing tracks*, *Manage testing tracks and edit tester lists*,
   *Release to production…*, and also *Manage store presence*, set at **account level** and saved with *Apply* then *Save changes*.
5. **Store listing:** 🤖 `node tools/play.mjs listing --images --details` (see step 7 for which login).
6. **Store settings:** category, tags (from Google's list, max 5), contact details.
7. **App content:** privacy policy, ads, app access, content rating, target audience, data safety.
   All the answers are prepared in `store/app-content.md`. Google offers no API for most of these forms.
8. **Testing:** a personal developer account created after Nov 2023 needs **12 testers opted in for 14 days** in a closed test before production.

---

## 7. Google Play API from your PC and from GitHub

`tools/play.mjs` talks to the Android Publisher API v3:

```powershell
node tools/play.mjs status
node tools/play.mjs listing [--images] [--details]            # text from store/listing.md, graphics from store/
node tools/play.mjs upload --aab <file> --track internal [--status draft]
node tools/play.mjs promote --from internal --to production --fraction 0.2
node tools/play.mjs rollout --track production --fraction 1
node tools/play.mjs halt --track production
```

**Login from your PC:** use your own Google account. It has every Play permission.

```powershell
gcloud auth application-default login --scopes="https://www.googleapis.com/auth/androidpublisher,https://www.googleapis.com/auth/cloud-platform"
gcloud auth application-default set-quota-project <game>-2026
$env:PLAY_QUOTA_PROJECT='<game>-2026'
node tools/play.mjs status
```

Undo with `gcloud auth application-default revoke`.

**Login from GitHub Actions:** keyless Workload Identity Federation, no JSON key anywhere.

```powershell
$P='<game>-2026'; $N='<project number>'
gcloud services enable androidpublisher.googleapis.com iamcredentials.googleapis.com sts.googleapis.com iam.googleapis.com --project $P
gcloud iam service-accounts create play-publisher --display-name "Google Play publisher (GitHub Actions)" --project $P
gcloud iam workload-identity-pools create github --location global --project $P
gcloud iam workload-identity-pools providers create-oidc github-actions --project $P --location global --workload-identity-pool github `
  --issuer-uri "https://token.actions.githubusercontent.com" `
  --attribute-mapping "google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.environment=assertion.environment,attribute.ref=assertion.ref" `
  --attribute-condition "assertion.repository=='advdk/<game>' && assertion.environment=='google-play'"
gcloud iam service-accounts add-iam-policy-binding play-publisher@$P.iam.gserviceaccount.com --project $P --role roles/iam.workloadIdentityUser `
  --member "principalSet://iam.googleapis.com/projects/$N/locations/global/workloadIdentityPools/github/attribute.repository/advdk/<game>"
```

**GitHub** 👤: Settings → Environments → `google-play`.
- **Variables:**
  - `GCP_WORKLOAD_IDENTITY_PROVIDER` = `projects/<N>/locations/global/workloadIdentityPools/github/providers/github-actions`
  - `GCP_SERVICE_ACCOUNT` = `play-publisher@<project>.iam.gserviceaccount.com`
- **Secrets:** run `tools\copy-ci-secrets.ps1` for `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD` and `ANDROID_KEY_PASSWORD`.
- Optionally allow only `v*` tags and `main`, and add yourself as a required reviewer.

**Workflows:**
- `play-release.yml`: tag `vX.Y.Z` → build → sign → verify → artifact → upload to internal → GitHub release.
- `play-promote.yml`: manual promote, rollout, halt or status.

---

## 8. Website kit for the company site

`website-kit/` contains `README.md` (handover notes), `game.json` (machine-readable), outlined SVG logos,
icons, hero/social banners, phone and desktop screenshots (PNG + WebP), a stand-alone privacy page
(HTML + Markdown, with the `#delete` anchor Google Play links to), and an example section with JSON-LD.
Regenerate the screenshots with Playwright from the local build. If the privacy page moves to the company
domain, update the Play listing and the in-game Settings link.

---

## 9. Gotchas we hit (read before starting)

1. **`NODE_ENV=production` is set on the PC.** `npm install` then skips dev packages. Use `npm install --include=dev`. CI runners are fine.
2. **The Play app can only be created in the Console,** and its package name is set by the **first manual upload**. Until then the API answers "package not found".
3. **Unpublished apps:** API releases must be `--status draft` until the first review, and edits can't use `changesNotSentForReview`.
4. **The service account couldn't change the store listing** ("The caller does not have permission") even with *Manage store presence* ticked, while its release permissions worked. We never found out why. The workaround is to run `listing` from your PC with your own login (step 7).
5. **Contact email and website** (`--details`) need more permission than the listing text. They worked with the owner's login.
6. **Upload key versus app signing key:** people copy the wrong block. The upload key is yours (starts with what `keytool` shows); the app signing key is Google's.
7. **`firebase apps:sdkconfig … -o file` sometimes wrote an old copy.** Writing stdout to the file got the fresh one. After adding a fingerprint, wait about a minute before downloading `google-services.json`.
8. **Google sign-in doesn't work inside an Android WebView popup.** Use `@capacitor-firebase/authentication` with `skipNativeAuth`, then `signInWithCredential` / `linkWithCredential` in the web SDK.
9. **Capacitor serves the app from `https://localhost`,** so "is localhost" checks turn developer mode on. Detect `Capacitor.isNativePlatform()` first.
10. **IAM changes take 1–5 minutes;** Play Console permission changes can take much longer.
11. **Claude's remote file tools may not write into `.github/`.** The templates live in `tools/ci/`; you copy them into `.github/workflows/` and push.
12. **When Claude copies files to the PC, re-copying to the same path sometimes wrote an old version.** Check MD5 hashes after copying, or copy under a new name and rename.
13. **`firebase` isn't on the PATH when npm scripts run through `cmd`** from some shells. Run `firebase deploy …` directly in PowerShell if `npm run deploy` says "not recognized".
14. **Play's API is sometimes briefly unavailable (503).** Retry after a few seconds.

---

## 10. Checklist for the next game

- [ ] Fill in the table in section 0 and pick the package name
- [ ] Create the GitHub repo, `git init`, `.gitignore`, first push
- [ ] Firebase project, web app, Firestore, Auth providers, rules and tests, hosting deploy
- [ ] Copy `tools/` as-is and `tools/ci/*.yml` → `.github/workflows/`; copy configs from Alderman and replace names
- [ ] Capacitor wrapper, manifest and Gradle edits, icons and splash, debug build
- [ ] Firebase Android app, debug fingerprints, `google-services.json`
- [ ] 👤 Upload key; register its fingerprints; signed `.aab`
- [ ] Store texts, graphics and App content answers in `store/`
- [ ] 👤 Play Console: create app → upload first `.aab` to internal → invite service account
- [ ] 👤 App signing fingerprints → Firebase → new `google-services.json`
- [ ] 🤖 `play.mjs listing --images --details` (your own login)
- [ ] 👤 Store settings (category, tags) and App content forms
- [ ] WIF pool and provider, GitHub environment variables and secrets, move workflows into `.github/`
- [ ] Tag `v1.0.1` and check it lands on internal testing
- [ ] Closed test with 12 testers for 14 days (personal account) → production with a staged rollout
- [ ] Website kit for the company site
