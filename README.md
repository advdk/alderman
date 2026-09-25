# Alderman: A Hanseatic Trading Tale

A slow trading game of the Hanse, Lübeck 1370. Plain HTML + JavaScript on Phaser 3, with Firebase for
cloud saves and the season leaderboard. No build step for the game itself; the Firebase SDK subset is
bundled once into `public/vendor/firebase.js` (`npm run build:firebase`).

## Layout

```
public/                 everything Firebase Hosting serves
  index.html            page markup (title screen, HUD, dialogs)
  css/style.css         all styles
  js/game.js            the whole game (world data, economy, rendering, audio)
  vendor/phaser.min.js  Phaser 3.80.1, pinned locally
  vendor/firebase.js    Firebase Auth + Firestore Lite, bundled from tools/firebase-entry.js
  audio/music/          looping tracks, crossfaded by game state
  audio/stings/         one-shot pieces played over the music
  favicon.svg
firebase.json           hosting, Firestore rules, Auth providers, emulators
firestore.rules         who may read/write what, and the leaderboard anti-cheat check
tools/                  Firebase bundle entry, rules tests
```

## Cloud saves and leaderboard

- Players are signed in anonymously on first load. Settings → "Link Google account" keeps the season
  with their Google account (survives a cleared browser, continues on another device).
- The save is copied to `users/{uid}/save/current` every 2 minutes and when the tab is hidden.
  At the title screen a newer cloud save is loaded automatically; during play the player is asked.
- Settings → Save file: download the season as JSON, or load one.
- Saves carry a version (`SAVE_VERSION` in game.js). To change the format, bump it and add a step
  to `UPGRADES`. Old saves are backed up once before upgrading; saves from a newer version are set aside.
- Leaderboard rows live in `boards/{season}/entries/{uid}`. When a season starts the server stamps its
  start time; a result may not claim more game days than the server clock allows at the fastest
  speed (4×). Winding the device clock forward is therefore rejected. Fortune itself is not verified.
- House names are asked for when a season begins and pass a word filter (`NameFilter` in game.js,
  English/German/Danish/Swedish with letter swaps). firestore.rules repeats the worst words as a backstop.
- Seasons played with the developer test pace are not submitted. The developer section in Settings only
  shows on localhost or with `?dev` in the address; there `window.__alderman` gives console helpers.

Test the rules: `npm install` then `npm run test:rules` (needs Java for the Firestore emulator).

## Music

Which track plays is decided in `Music.want()` in `js/game.js`:

| Moment | Track |
|---|---|
| Title screen | `title-theme.mp3` |
| Town by day | `harbor-day.mp3` |
| Town by night | `harbor-night.mp3` |
| Sea chart | `sea-chart.mp3` |
| Dec–Feb (sea chart, town by day) | `winter-baltic.mp3` |
| Town with a church festival running | `church-festival.mp3` |
| Town with another event running (fire, hard winter, diet…) | `important-news.mp3` |
| Factor's letter opens | `stings/letter.mp3` |
| Elected alderman | `stings/victory.mp3` |
| Bankruptcy | `stings/bankruptcy.mp3` |

Synthesised surf, gulls, rain and the noon bell still come from the Web Audio code (the "Sound effects" setting).
Browsers only start audio after a tap, so the title theme begins on the first touch or click.

## Run locally

```
firebase emulators:start --only hosting,auth,firestore   # http://localhost:5000/?emu uses local Auth/Firestore
```
Any static server works too (`npx serve public`). Opening `index.html` straight from disk will not play music.

## Deploy to Firebase (testing)

The test build runs as the live web app: https://alderman-2026.web.app (`npm run deploy`).

```
firebase login                      # project alderman-2026 is set in .firebaserc
firebase deploy --only firestore,auth
firebase hosting:channel:deploy preview --expires 7d   # temporary preview URL
firebase deploy --only hosting,firestore,auth          # live site
```



## Android app (Google Play)

Capacitor 8 wrapper in `android/` (package `com.midnightsyntaxlabs.alderman`, target API 36, portrait).
The same `www/` build runs on the web and in the app; `public/js/native.js` adds notifications, the back
button and native Google sign-in when running inside the app.

```
npm run android:apk-debug   # debug APK -> android/app/build/outputs/apk/debug/
npm run android:bundle      # signed release bundle (needs android/keystore.properties, see tools/make-upload-key.ps1)
npx capacitor-assets generate --android   # regenerate icons/splash from assets/
```

The Play checklist and status are in `RELEASE.md`. Store text and graphics are in `store/`.

## CI/CD

GitHub Actions publish to Google Play: push a tag `vX.Y.Z` → signed bundle → internal testing; the
*Play promote* workflow moves it on to closed testing and production. Setup and day-to-day use: `RELEASE.md`.
