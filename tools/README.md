# tools/: shared build and release tools

These tools don't depend on any one game. Copy the whole folder into a new game. The game's name comes from
`package.json` (`name`, `version`, `androidVersionCode`) and the Android package from
`capacitor.config.json` (`appId`). The full process is in `../PLAYBOOK-web-game-to-google-play.md`.

| File | What it does | Run |
|---|---|---|
| `build.mjs` | Copies `public/` to `www/`, re-encodes audio to 96 kbps (cached), stamps `<meta name="<name>-version">` | `npm run build` |
| `firebase-entry.js` | Lists the Firebase SDK parts the game uses; bundled to `public/vendor/firebase.js` | `npm run build:firebase` |
| `play.mjs` | Google Play API: `status`, `listing [--images] [--details]`, `upload`, `promote`, `rollout`, `halt` | `node tools/play.mjs <command>` |
| `make-upload-key.ps1` | Creates the upload key `%USERPROFILE%\.android-keys\<name>-upload.jks` and `android/keystore.properties`. **You run it yourself; it asks for a password.** | `powershell -ExecutionPolicy Bypass -File tools\make-upload-key.ps1` |
| `copy-ci-secrets.ps1` | Puts the three signing secrets on the clipboard one by one, for GitHub → Environments → google-play | `powershell -ExecutionPolicy Bypass -File tools\copy-ci-secrets.ps1` |
| `rules.test.mjs` | Firestore security rules tests (emulator, needs Java) | `npm run test:rules` |
| `ci/play-release.yml` | Workflow template: tag `vX.Y.Z` → signed `.aab` → Play internal testing → GitHub release | copy to `.github/workflows/` |
| `ci/play-promote.yml` | Workflow template: promote, rollout, halt or status, run by hand | copy to `.github/workflows/` |

## What the tools expect from the project

- `package.json` has `name` (lower case, used for file names), `version` (`X.Y.Z`) and `androidVersionCode` (for local builds),
  plus the scripts and devDependencies from Alderman (`build`, `build:firebase`, `test:rules`, `android:*`, `play`;
  `esbuild`, `firebase`, `@firebase/rules-unit-testing`, `google-auth-library`, `ffmpeg-static`, `@capacitor/cli`, `@capacitor/assets`).
- `capacitor.config.json` has `appId` (the Android package) and `webDir: "www"`.
- `android/app/build.gradle` reads `APP_VERSION_NAME` / `APP_VERSION_CODE` and the signing variables (copy the blocks from Alderman).
- `store/listing.md` follows Alderman's layout (details table, "## Short description", "## Full description", quoted with `>`),
  `store/icon-512.png`, `store/feature-graphic.png`, `store/screenshots/*.png`, `store/whatsnew/<lang>.txt`.
- Screenshot order on the store page: `store/screenshots/order.txt` (one file name per line); files not listed follow alphabetically.

## Logging in to Google Play from your PC

```powershell
gcloud auth application-default login --scopes="https://www.googleapis.com/auth/androidpublisher,https://www.googleapis.com/auth/cloud-platform"
$env:PLAY_QUOTA_PROJECT = '<firebase project id>'
node tools/play.mjs status
```

In GitHub Actions the workflows log in without a key (Workload Identity Federation); see the playbook, section 7.
