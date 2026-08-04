# Handoff: Storyboard Web App

## Overview
An interactive storyboard-builder web app, generalized from a 15-panel safety-education storyboard ("Safer Injecting: Peptides"). Users create one or more storyboards, each a grid of numbered panels (image + title + caption), can add/remove/reorder panels, upload an image per panel, edit captions/titles inline, save multiple storyboards locally, and export any storyboard to a print-ready PDF (A4 landscape, 3 panels per row, 6 panels per page).

## About the Design Files
The bundled HTML file (reference-design.html) is a **design reference** built as an HTML prototype — it shows the intended visual style, grid layout, and print pagination, not production code to copy directly. Recreate this in a plain HTML/CSS/JS app (no framework/build step) using the browser's native APIs (localStorage, File/drag-drop for images, window.print() for PDF export) — do not just embed the reference file as-is.

## Fidelity
- **Visual style (hifi)**: colors, type, spacing, borders, and the print grid layout should match the reference exactly — these come from a bound design system ("Modernist"), detailed under Design Tokens below.
- **App functionality (lofi/net-new)**: the reference file is a static grid with a bare-bones add/remove-panel proof of concept. The interactive app (multi-storyboard management, image upload, inline editing, reordering, persistence) is net-new — use the reference only for visual/layout direction, not as a functional spec.

## Screens / Views

### 1. Storyboard list (new — not in reference)
- Purpose: pick an existing storyboard or start a new one.
- Layout: simple list/grid of storyboard cards (title + panel count + last-edited), a "+ New storyboard" action.
- Each card opens the Storyboard Editor below.

### 2. Storyboard editor (based on reference-design.html)
- Purpose: build/edit one storyboard's panels.
- Layout: header bar (storyboard title, editable inline) + a responsive grid of panel cards, 3 columns wide on screen; a fixed "+ Add panel" action below the grid; an "Export to PDF" action in the header.
- Panel card (repeats N times):
  - Border: 2px solid divider color, no corner radius.
  - Header strip: small square number badge (accent-filled, white bold number) + title text (bold, left-aligned) + a "x" remove button (accent-700 color, only for user-added panels in the reference, but should apply to all panels in the real app since it's now editable).
  - Image area: drop-target / click-to-upload image slot, object-fit: contain (show full image, not cropped), roughly 4:3.
  - Caption (script): body text below the image, inside the card, 2px top divider separating it from the image. Placeholder text "Add script here." when empty.
  - Action: a second text box below the caption, same style, 2px top divider separating it from the caption. Placeholder text "Add action here." when empty.
  - Title, caption, and action are all directly click-to-edit (contenteditable or click-to-reveal text input).
  - Panels are drag-reorderable (grab the header strip or a drag handle).

## Interactions & Behavior
- **Add panel**: click "+ Add panel" -> appends a new blank panel (placeholder image slot, "New Panel" title, empty caption, empty action) to the end of the current storyboard, focus its title for immediate editing.
- **Remove panel**: click "x" on a panel's header -> remove it immediately (no confirmation needed for a lightweight tool; consider undo-toast if time allows).
- **Reorder panels**: drag-and-drop a panel card to a new position; panel numbers renumber automatically (1..N) after reorder/add/remove.
- **Edit title/caption/action**: click into the text -> becomes editable in place; blur/Enter commits.
- **Upload image**: click or drag-and-drop an image file onto a panel's image area -> shows the image immediately. Images are downscaled to a max of 1600px on the long edge and re-encoded as JPEG (quality 0.85) before being stored as a data URL, to keep well within localStorage's per-origin quota.
- **Download storyboard**: in the editor header, "Download storyboard" exports the current storyboard (title, panels, images) as a `.json` file -> lets someone share their progress with another person, who can open the app in their own browser and use Import to continue editing it. No hosting/accounts needed since there's no backend; this is an async hand-off, not live co-editing.
- **Import storyboard**: from the list view, "Import" opens a file picker for a previously-downloaded `.json` file -> adds it to the current browser's storyboards (with a freshly-generated id, so importing your own export doesn't collide with the original) and opens it in the editor. Invalid files show an alert instead of failing silently.
- **Export to PDF**: paginate panels 6-per-page (3 columns x 2 rows) onto A4-landscape pages matching the reference's print layout, then trigger the browser print dialog (window.print()) with print-only CSS (@page { size: A4 landscape; margin: 0 }, .page { page-break-after: always }) so "Save as PDF" produces the same 3-per-row grid.
- **New storyboard**: creates an empty storyboard with a default title ("Untitled storyboard") and zero panels, opens the editor.
- **Delete storyboard**: from the list view, remove a storyboard and its data from localStorage (confirm before deleting).

## State Management
- storyboards: array of { id, title, createdAt, updatedAt, panels: [{ id, num, title, caption, action, imageDataUrl }] }, persisted to localStorage (single "storyboards" key, JSON-stringified) on every change.
- Current view state: which storyboard (if any) is open — can be a simple in-memory router (list vs. editor) or a URL hash (#/storyboard/<id>).
- Images: store as base64 data URLs directly in the storyboard JSON for simplicity (fine at this scale — 15-20 panels of modest images); if storyboards grow large, consider IndexedDB instead of localStorage for the images.

## Design Tokens
(from the bound "Modernist" design system; accent color has been swapped from the system's default red to a custom blue for this project)
- Background: #f3f2f2
- Text: #201e1d
- Accent (badges, primary actions, links): #002FA7 (Yves Klein blue) — hover/pressed step: #002791, deep/text-safe step: #001f70
- Neutral surface tint (header strips): light gray, close to #efeeed
- Dividers/borders: 2px solid, dark gray/black — render as a strong, near-black 2px rule, not a hairline
- Corner radius: 0 everywhere (no rounded corners)
- Font: "Archivo" for both headings and body text (Google Font, weights 400/700)
- Type sizes used: page title ~26px/700, panel title ~11-13px/700, caption body ~12-14px/400, page-number label ~13px/400
- Spacing: card gaps ~16-18px, card internal padding ~8-14px, page padding ~36px

## Assets
- Google Font "Archivo" (load from Google Fonts, weights 400 and 700).
- No icon set required beyond a plain "x" (remove) and "+" (add) glyph; a drag-handle icon (e.g. Lucide "grip-vertical") is a nice-to-have for the reorder handle.
- Panel images are entirely user-supplied (drag-and-drop); no bundled image assets.

## Files
- reference-design.html — the HTML design reference (static 3-column, 6-per-page A4-landscape print layout) to match visually.
