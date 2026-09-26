# Alderman roadmap (after 1.0.2)

## 1.0.3: German, the rest of the way
- Letters from the factor, town events, the chronicle, notifications and news toasts in German.
- The chronicle stores finished English sentences today; store a message key plus values instead, so old entries can show in either language.
- `public/js/i18n.js` already handles menus and buttons; add the story text to it (or move to keyed messages).

## 1.1: Town production (tester request)

"When you have enough standing in a town, you can buy production of what the town makes. It needs a warehouse and workers,
and some goods need other goods (beer needs grain in the warehouse)."

**Design draft**
- A **workshop** can be bought in a town where you are *Respected* (tier 2) and own the warehouse. One workshop per town at first.
- It makes one of the town's `prod` goods, chosen when bought: brewery (beer), saltworks (salt), weaving shed (cloth), sawmill (timber), smithy (iron), fishery (herring)...
- **Workers** are hired like sailors (from the town's pool), with a daily wage. Output scales with workers: `output = full × min(1, workers / needed)`.
- **Inputs** come from the same warehouse, e.g. brewery: 2 grain → 3 beer a day; smithy: 1 timber → 1 iron; weaving: none (wool assumed). If inputs are short, production drops to what the inputs allow, and the warehouse card says why.
- Output goes into the warehouse, so it works with managers and trade routes.
- Selling your own production raises standing a little less than trading, so the path to alderman still runs through trade.
- UI: a "Workshop" card in the warehouse dialog (workers, inputs, output per day, a small bar), and a building on the town map.

## 1.1: Nicer towns (tester request)
- Redraw the town houses with more variety: stepped brick gables, half-timbered fronts, warehouses with hoists, church spires per town.
- Landmarks per town (Lübeck's Holstentor and Marienkirche, Visby's walls, Bergen's Bryggen wharf) so each port feels different.
- Softer lighting and shadows, quay details (cranes, barrels, nets), people walking.

## Monetization
See `monetization-proposal.md`: waiting for a decision.
