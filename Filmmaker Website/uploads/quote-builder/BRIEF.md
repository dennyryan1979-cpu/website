# Production Quote Builder — Claude Code Brief

## Overview

A local web app for building video production & post-production quotes.
Replaces an existing interactive HTML prototype (single-file widget) with a
proper app: persistent SQLite storage, an editable gear catalogue, saved
quote history, and branded PDF export.

Runs locally only — no auth, no deployment required.

## Stack

- **Frontend:** Vite + React + Tailwind CSS
- **Backend:** Node.js + Express (local API server)
- **Database:** SQLite (via `better-sqlite3`)
- **PDF export:** `@react-pdf/renderer` or Puppeteer (print the quote view to PDF) — pick whichever is simpler to wire up
- **Dev run:** `npm run dev` starts both frontend (Vite) and backend (Express) — use `concurrently` or two terminal scripts

This matches the stack already used for the `~/expense-tracker` project, so
folder structure and conventions should feel familiar.

## Folder structure (suggested)

```
quote-builder/
  server/
    db.js              # SQLite connection + schema init
    seed.js            # seeds initial gear catalogue + crew rates
    routes/
      catalogue.js      # CRUD for gear items
      quotes.js          # CRUD for saved quotes
    index.js            # Express app entry
  src/
    components/
      CatalogueManager.jsx
      QuoteBuilder.jsx
      QuoteLineItem.jsx
      QuoteTotals.jsx
      PresetPicker.jsx
      QuoteHistory.jsx
      PdfExportButton.jsx
    lib/
      api.js             # fetch wrappers for backend routes
      calculations.js     # subtotal / GST / multi-day discount logic
    App.jsx
    main.jsx
  data/
    quotes.db            # SQLite file (gitignored)
  BRIEF.md (this file)
  package.json
```

## Database schema

### `catalogue` table
| column | type | notes |
|---|---|---|
| id | INTEGER PRIMARY KEY | |
| category | TEXT | crew / camera / lens / audio / lighting / grip / post |
| name | TEXT | item description |
| rate | REAL | dollars |
| unit | TEXT | day / hour |
| active | INTEGER | 1 = shown in picker, 0 = archived (soft delete) |

### `quotes` table
| column | type | notes |
|---|---|---|
| id | INTEGER PRIMARY KEY | |
| client_name | TEXT | |
| project_name | TEXT | |
| quote_ref | TEXT | |
| quote_date | TEXT | ISO date |
| day_multiplier | REAL | 1 / 0.9 / 0.8 / 0.65 |
| gst_enabled | INTEGER | 1/0 |
| notes | TEXT | |
| created_at | TEXT | timestamp |
| updated_at | TEXT | timestamp |

### `quote_line_items` table
| column | type | notes |
|---|---|---|
| id | INTEGER PRIMARY KEY | |
| quote_id | INTEGER | FK -> quotes.id |
| catalogue_id | INTEGER | FK -> catalogue.id, nullable (custom rows allowed) |
| name | TEXT | snapshot of name at time of quoting (don't rely on live join) |
| category | TEXT | snapshot |
| rate | REAL | snapshot — quotes must NOT change retroactively if catalogue prices change later |
| unit | TEXT | |
| qty | REAL | |
| days | REAL | ignored if unit = hour |

**Important:** line items snapshot the name/rate/category at the time they're
added to a quote. Editing the catalogue later should never alter historical
quotes.

## Seed data

Seed the `catalogue` table on first run with the full gear list already
established in this conversation: ~12 crew roles, ~13 cameras, ~16 lenses,
~13 audio items, ~18 lighting items, ~15 grip/support items, ~7 post/edit
items (70+ rows total). Pull rates from the existing HTML widget's
`CATALOGUE` object — Claude Code should reuse those exact figures rather
than re-deriving them.

Also seed 5 starter presets matching the existing widget: Interview /
talking head, Run & gun / doco, Corporate promo, Narrative / short film day,
Event / multi-cam. Presets can be a simple JSON seed (catalogue_id + qty +
days) rather than a separate DB table for v1, unless it's just as easy to
make a `presets` + `preset_items` table — Claude Code's call.

## Features (priority order)

1. **Quote builder (core)** — same UX as the existing HTML widget: add
   items from a category + item dropdown, custom rows, qty/day editing,
   day-rate multiplier (1/0.9/0.8/0.65), GST toggle, live totals.
2. **Editable catalogue** — a settings/catalogue screen to add, edit,
   archive gear items and crew rates. Changes here affect future quotes
   only (see snapshot rule above).
3. **Quote history** — list of saved quotes (client, project, date, total),
   click through to reopen/edit/duplicate a past quote.
4. **Branded PDF export** — generate a clean PDF of the quote with Denny's
   name/business details as a simple letterhead (placeholder fields for
   logo/business name/ABN — Denny will fill these in), line items table,
   totals, and notes. This replaces the "print to PDF via browser" approach
   in the HTML widget with a proper generated PDF.

## Design direction

Keep the clean, flat aesthetic of the existing HTML widget — white
surfaces, thin borders, category pills with soft background colors,
no gradients or heavy shadows. Tailwind utility classes are fine; no need
for a component library. This is a working tool, not a marketing site, so
prioritise clarity and speed of data entry over visual flourish.

## Out of scope for v1

- Multi-user / login
- Cloud sync or deployment
- Mobile app packaging (this is a local web app, run via `npm run dev` and
  opened in a browser — can be revisited as a PWA later if needed)
- Client-facing quote acceptance/e-signature flow

## Reference

The full working logic (catalogue data, preset definitions, GST/multiplier
calculations, copy-as-text export) already exists in a single HTML widget
built earlier in this project — it's the source of truth for data and
calculation logic. Claude Code should treat it as the spec to port into the
proper app, not redesign from scratch.
