---
inclusion: fileMatch
fileMatchPattern: "*.css"
---

# CSS File Guide

This steering file activates automatically when a `.css` file is open.

## style.css Section Map

| Section | What it covers |
|---------|---------------|
| 1  | Design tokens — all CSS custom properties (`:root` + `[data-theme="dark"]`) |
| 2  | Reset & base — box-sizing, font, body background |
| 3  | Header — sticky nav, logo, tab buttons, theme toggle |
| 4  | Main layout — max-width container, view show/hide, view-header |
| 5  | Summary cards — `.card`, colour variants, hover lift |
| 6  | Spending limit bar — `.limit-bar-wrap`, progress fill states |
| 7  | Dashboard grid — two-column CSS Grid, tablet breakpoint |
| 8  | Panels — `.panel`, `.panel-title`, `.section-sub-title` |
| 9  | Forms — inputs, selects, colour picker, focus ring |
| 10 | Buttons — `.btn-primary`, `.btn-secondary`, `.btn-icon` |
| 11 | List header + controls — filter/sort selects, search bar |
| 12 | Transaction list items — `.tx-item`, icon, meta, amount, delete |
| 13 | Empty state — `.empty-state` |
| 14 | Monthly summary — month nav, CSS bar chart rows |
| 15 | Categories view — `.cat-item`, swatch, delete |
| 16 | Alert banner — warning colours, close button |
| 17 | Toast — fixed bottom-right, slide-up animation |
| 18 | Limit section form layout |
| 19 | Responsive — 640px and 400px breakpoints |
| 20 | Utility — `.sr-only`, `@keyframes shake` |
| 21 | Pie chart panel — canvas wrap, empty overlay, legend |

## Adding New Styles
- New component colours → add tokens to `:root` AND `[data-theme="dark"]`
- New layout section → add a numbered comment banner to match the map above
- Animations → use `@keyframes` at section 20, reference by name
- Never hardcode colour hex values outside the token section

## Token Reference (most-used)
```css
/* Backgrounds */
--bg-app, --bg-surface, --bg-surface-2, --bg-header

/* Text */
--text-primary, --text-secondary, --text-muted, --text-inverse

/* Semantic */
--income-bg/text/border
--expense-bg/text/border
--balance-bg/text/border
--savings-bg/text/border

/* Brand */
--brand-500 (#6366f1), --brand-400, --brand-600, --brand-50

/* Status */
--danger (#ef4444), --warning (#f59e0b), --success (#10b981)

/* Structural */
--gap (1.25rem), --gap-sm (.75rem)
--radius (.875rem), --radius-sm (.5rem), --radius-lg (1.25rem)
--shadow-sm, --shadow-md, --shadow-lg
--transition (.22s cubic-bezier)
--header-h (64px), --max-w (1200px)
```
