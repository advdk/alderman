# Monetization proposal: ads with a one-time "Remove ads"

Status: **proposal, not built.** Nothing here ships until Andy says go. Written for 1.0.2 (September 2026).

## The idea

Show a full-screen ad now and then when the player **opens a town**, and sell a one-time
**"Remove ads forever"** purchase. Nothing you can pay for or watch changes the game itself, so the
leaderboard stays fair: a player who never pays has exactly the same Baltic as one who does.

## Rules that keep it fair and calm

| Rule | Why |
|---|---|
| Ads only when entering a town view (a natural pause), **never** on app start, resume, while trading, or in a dialog | AdMob asks for interstitials at natural breaks, and forbids ads on app load/exit or ones that surprise a tap |
| At most **1 ad per 4 town openings**, and at least **8 minutes** of real time between ads | A calm game; the player should notice ads rarely |
| No ads in the first **20 minutes** of a new install, and none during the welcome letters | First impressions |
| No ads while the game is paused, or while a letter/dialog is open | Avoids accidental clicks (a policy violation) |
| No rewarded ads that give marks, ships, speed or standing | That would be pay/watch-to-win and would spoil the leaderboard |
| The web version (alderman-2026.web.app) stays ad-free for now | Keeps the site clean; H5 Games Ads could be looked at later |

If we later want an optional rewarded ad, it should give **cosmetics only** (a sail colour, a house banner on the leaderboard).

## "Remove ads forever"

- One **non-consumable in-app product** in Google Play, id `remove_ads`, suggested price **€2.99** (Play converts to local prices).
- Bought through **Google Play Billing** (required for digital goods on Play). Capacitor options:
  `@revenuecat/purchases-capacitor` (easiest, free tier) or `cordova-plugin-purchase` (no third party).
- On every start the app asks Play for the player's purchases, so it survives reinstalls and new phones on the same Google account.
  A **Restore purchase** button in Settings does the same by hand.
- Optional: store an `adFree` flag with the cloud save so a linked Google account shows no ads on any device.
- Also worth offering as a **supporter pack** (same product): a small cosmetic thank-you, such as a gold pennant next to the house name.

## What has to change besides code

| Area | Change |
|---|---|
| SDKs | Google Mobile Ads (AdMob) via `@capacitor-community/admob`; Play Billing library via the plugin above |
| Consent | Google's **UMP** consent form for EEA/UK/Switzerland players before any ad request (Google's EU user consent policy); a "Privacy choices" button in Settings |
| Manifest | `com.google.android.gms.permission.AD_ID` (targetSdk 33+ must declare it to use the advertising ID); AdMob app id meta-data |
| Play Console | "Contains ads" = yes; "In-app purchases" shown on the listing; **Advertising ID** declaration; **Data safety** updated: device or other IDs, app interactions, diagnostics collected and shared with AdMob for advertising/analytics; content rating questionnaire re-answered |
| Store listing | Remove "No ads. No in-app purchases." from the description; say instead "Optional one-time purchase removes ads. Nothing can be bought that changes the game." |
| Privacy policy | Add AdMob, the advertising ID, consent, and Play Billing; update `website-kit/privacy/` and `public/privacy.html` together |
| Website kit | Features list and "Free · No ads" wording in `website-kit/README.md`, `game.json` and the example section |
| Audience | Keep target age 13+ and not "designed for children"; otherwise the Families ads rules apply |

## Rough effort

About 2–3 days: AdMob + UMP (1 day), billing + restore + Settings UI (1 day), store/privacy/data-safety updates and testing with AdMob **test ad units** and Play **licence testers** (0.5–1 day).

## Alternatives considered

| Option | Fair? | Notes |
|---|---|---|
| **Ads + remove-ads purchase (this proposal)** | Yes | Simple, familiar, no gameplay effect |
| Paid app (€2–4 up front) | Yes | Fewer installs; the leaderboard needs players |
| Cosmetic shop (sails, banners, harbour decorations) | Yes | More art work; can be added later on top of this |
| Premium "Merchant's edition" (extra scenarios, e.g. a Bergen start) | Mostly | New content, not power; bigger job |
| Selling marks, speed-ups, ships | **No** | Pay-to-win; would ruin the season leaderboard |

## Decision needed

1. Go ahead with ads + remove-ads for Android? 2. Price (€2.99 suggested)? 3. RevenueCat or no third party?

Sources: [AdMob interstitial ad guidance](https://support.google.com/admob/answer/6066980),
[Disallowed interstitial implementations](https://support.google.com/admob/answer/6201362?hl=en),
[AdMob policies and restrictions](https://support.google.com/admob/answer/6128543?hl=en),
[Play Console: Advertising ID](https://support.google.com/googleplay/android-developer/answer/6048248?hl=en),
[AdMob privacy strategies for Android](https://support.google.com/admob/answer/11402075?hl=en).
