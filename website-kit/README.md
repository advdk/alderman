# Alderman: website kit

Everything the web team needs to present **Alderman: A Hanseatic Trading Tale** on the Midnight Syntax Labs website:
text, images, brand details, a ready privacy page, and an example section.

- **Machine-readable:** `game.json` (all text, links, colours, and every image with size and alt text).
- **Human-readable:** this file.

## Contents

```
website-kit/
├─ README.md                  this file
├─ game.json                  names, descriptions, features, links, brand, image list (for import)
├─ privacy/
│  ├─ privacy-policy.html     complete stand-alone page (no external files); or copy the <article> into your template
│  └─ privacy-policy.md       the same text as Markdown with front matter, for a CMS
├─ example/
│  └─ alderman-section.html   a reference section: hero, buttons, features, screenshots, JSON-LD
└─ images/
   ├─ logo/                   lockup (ship + wordmark) and wordmark, light and dark versions, SVG + PNG; emblem
   ├─ icon/                   app icon 1024 / 512 / 192 / 180 / 32 px, favicon.svg
   ├─ banners/                hero 1920×1080, background without text, social share 1200×630, Play feature 1024×500
   └─ screenshots/
      ├─ phone/               6 portrait screenshots, 1080×1920
      └─ desktop/             4 browser screenshots, 1920×1080
```

Every PNG/JPG banner and screenshot also comes as **WebP** with the same name. Use the WebP on the site and keep the PNG/JPG as fallback or for press.

## Links

| What | URL | Status |
|---|---|---|
| Play in the browser | https://alderman-2026.web.app | Live (test build) |
| Google Play | https://play.google.com/store/apps/details?id=com.midnightsyntaxlabs.alderman | Works once the app is public (in internal testing now) |
| Privacy policy (current) | https://alderman-2026.web.app/privacy.html | Live; Google Play and the game link here today |
| Contact | andvidk@gmail.com | |

For the Google Play button, use Google's official **"Get it on Google Play"** badge from https://play.google.com/intl/en_us/badges/, exactly as provided. Don't redraw or recolour it.

## Text

**Name:** Alderman: A Hanseatic Trading Tale. Short form: *Alderman*. The Google Play listing is titled *Alderman: Hanseatic Trade*, because Play allows only 30 characters.

**Tagline:** Trade the medieval Baltic from Lübeck, 1370.

**Short description (80 characters):** Trade the medieval Baltic from Lübeck, 1370. A slow, calm game of the Hanse.

**Description:**
Lübeck, Anno Domini 1370. The Kontor is yours, and one cog lies at the quay. Alderman is a slow, calm trading game set in the towns of the Hanseatic League. Buy salt and beer where they are cheap, carry them across the Baltic, and sell where they are wanted. Grow a single ship into a fleet, win the trust of twelve towns from Bergen to Reval, and be elected alderman of the Hanse.

**Features:**
- A day on the Baltic passes in about five minutes. Send a ship out and come back to news from your factor.
- Real markets: every barrel moves the price, and the market shows the true cost of a whole lot before you trade.
- Twelve Hanseatic towns and nine goods, with festivals, hard winters, fires, failed harvests and herring shoals.
- Hire crews, order cogs and hulks, buy warehouses, hire managers, and run trade routes while you sleep.
- A season leaderboard: everyone sails the same Baltic. Become alderman fastest, or build the richest house.
- No ads, no in-app purchases, no energy timers. Plays offline, with an optional cloud save through a Google account.

**Facts:** Strategy / trading simulation · Web browser and Android · Free · English · Target audience 13+.

## Brand

| Colour | Hex | Used for |
|---|---|---|
| Sea | `#1c2a2c` | Page background behind the game, dark sections |
| Brass | `#d2a957` | Accents, primary button |
| Parchment | `#ecdcb2` | Text on dark, the light logo |
| Parchment light | `#f1e3bd` | Light panels |
| Ink | `#2b1c10` | Text on parchment, the dark logo |
| Sail red | `#b2462f` | Small highlights only |

**Fonts:** *IM Fell English SC* for titles and *EB Garamond* for body text and the italic subtitle. Both are free under the SIL Open Font License, from Google Fonts or Fontsource.
The SVG logos have the lettering converted to outlines, so the site doesn't need the fonts to show them.

**Logo use:**
- Use `alderman-lockup-light` on dark or photographic backgrounds and `alderman-lockup-dark` on light ones.
- Keep clear space around the logo of at least the height of the ship's hull.
- Don't stretch, recolour or add effects.
- Keep the logo at least 160 px wide on screen.

## Images at a glance

| File | Size | Suggested use |
|---|---|---|
| `banners/hero-1920x1080` | 1920×1080 | Page header with the logo already on it |
| `banners/background-town-1920x1080` | 1920×1080 | Header background when you set your own headline (the example uses this) |
| `banners/social-share-1200x630` | 1200×630 | `og:image` / `twitter:image` |
| `banners/google-play-feature-1024x500` | 1024×500 | Wide card or tile |
| `icon/alderman-icon-*` | 1024…32 | Game tile in a games list, favicon, touch icon |
| `screenshots/phone/*` | 1080×1920 | Carousel (portrait). Order: town, market, sea chart, fleet, letter, title |
| `screenshots/desktop/*` | 1920×1080 | Landscape gallery or lightbox |

The alt text for every image is in `game.json` → `images[].alt`.

## Privacy page

`privacy/privacy-policy.html` is the policy for Alderman. You can host it as it is (it needs nothing else), or copy the `<article class="alderman-privacy">` into the site template. The styles are scoped to that class.

1. **Keep the anchor.** The page has a section with `id="delete"`. Google Play's data-deletion link points to `…#delete`.
2. **Tell Andy the final URL.** Once it's on the company site (for example `/games/alderman/privacy`), Andy needs to change it in two places: the Google Play listing and the in-game Settings link. After that, keep the URL stable.
3. **Don't edit the wording yourself.** It describes what the game actually collects, and the Google Play data-safety form must say the same thing. Send changes to Andy so both stay in step.

## SEO snippet

`example/alderman-section.html` ends with a `VideoGame` JSON-LD block you can reuse. Replace `"image"` with the absolute URL of the social-share image on your site. For the page `<head>`:

```html
<title>Alderman: A Hanseatic Trading Tale · Midnight Syntax Labs</title>
<meta name="description" content="Trade the medieval Baltic from Lübeck, 1370. A slow, calm trading game of the Hanse for the web and Android. Free, no ads.">
<meta property="og:title" content="Alderman: A Hanseatic Trading Tale">
<meta property="og:description" content="Trade the medieval Baltic from Lübeck, 1370. A slow, calm game of the Hanse.">
<meta property="og:image" content="https://YOUR-SITE/…/social-share-1200x630.jpg">
<meta name="twitter:card" content="summary_large_image">
```

## Rights

© 2026 Midnight Syntax Labs. The logo, game art and screenshots may be used to present Alderman on the company website and in press coverage.
