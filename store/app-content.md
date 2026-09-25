# Play Console → App content — answers for Alderman

These match what the code actually does (Firebase Auth anonymous + optional Google, Firestore Lite,
local notifications, no analytics, no crash reporting, no ads, fonts and assets bundled).
If you later add Analytics or Crashlytics, update this file, the Data safety form and privacy.html together.

## Privacy policy
https://alderman-2026.web.app/privacy.html

## Ads
**No**, the app does not contain ads.

## App access
**All functionality is available without special access.** There is no login wall: players are signed in
anonymously; linking a Google account is optional.

## Content rating (IARC questionnaire)
- Category: **Game** → (other / all other game types)
- Violence, fear, sexuality, language, drugs/alcohol: **No** to all.
  (Beer and wine are *trade goods* only; nobody is shown drinking. If the questionnaire asks about
  "references to alcohol", answering *Yes – references only* is the cautious choice; expected result
  is still PEGI 3 / Everyone, possibly PEGI 7 with that answer.)
- Gambling / simulated gambling: **No**.
- **Users can interact / exchange content: Yes, limited** — the house name a player chooses is shown
  on the public leaderboard. There is no chat and no messaging. Names pass a profanity filter.
- Shares the user's location: **No**. Digital purchases: **No**.

## Target audience and content
- Age groups: **13–15, 16–17, 18 and over** (not under 13, so the Families policy does not apply).
- Appeals to children? **No** (historical trading strategy, text-heavy).

## News app: No.  COVID-19 app: No.  Government app: No.  Financial features: None.  Health: No.

## Data safety form

**Does your app collect or share any of the required user data types? — Yes.**
**Is all user data encrypted in transit? — Yes** (HTTPS only; cleartext is disabled in the manifest).
**Do you provide a way for users to request that their data be deleted? — Yes**
 (in-app: Settings → Delete my data; web: https://alderman-2026.web.app/privacy.html#delete).
**Account creation method:** "Username and other authentication" is not used; choose
 *OAuth (Sign in with Google)* as optional, plus anonymous accounts created automatically.
 Delete-account URL: https://alderman-2026.web.app/privacy.html#delete

| Data type (Play category) | Collected | Shared | Optional? | Purpose(s) | Notes |
|---|---|---|---|---|---|
| Personal info → **Email address** | Yes | No | Optional | Account management | Only if the player links a Google account |
| Personal info → **Name** | Yes | No | Optional | Account management | Google display name, only when linked |
| Personal info → **User IDs** | Yes | No | Required | App functionality, Account management | Firebase anonymous user ID |
| App activity → **Other user-generated content** | Yes | No | Required | App functionality | House name, shown on the leaderboard |
| App activity → **Other actions** | Yes | No | Required | App functionality | Game save and season results (leaderboard) |

Not collected: location, contacts, photos/files, messages, audio, health, financial info, web history,
device or other IDs, crash logs, diagnostics, analytics.
"Shared" is **No** for everything: Google (Firebase) processes the data on our behalf, which Play does
not count as sharing.
Data is processed ephemerally? **No** (it is stored).

## Permissions used (for any reviewer question)
- INTERNET, ACCESS_NETWORK_STATE: cloud save and leaderboard.
- POST_NOTIFICATIONS: optional reminders (ship arrivals, town news), scheduled on the device.
- RECEIVE_BOOT_COMPLETED, WAKE_LOCK: keep scheduled reminders after a phone restart (Local Notifications plugin).
- Exact alarms are **removed** from the manifest, so no exact-alarm declaration is needed.
