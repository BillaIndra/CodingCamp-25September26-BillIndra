# FinanceFlow — Project Overview

## What This Project Is
FinanceFlow is a personal finance tracker built as a standalone web app.
It runs entirely in the browser — no server, no build step, no dependencies to install.

## Tech Stack
- **HTML** — semantic structure, ARIA accessibility attributes
- **CSS** — single stylesheet, CSS custom properties, dark/light mode, responsive grid
- **JavaScript** — Vanilla JS (no frameworks), LocalStorage, Chart.js CDN for pie chart

## File Structure
```
finance-tracker/
├── index.html        # App shell — Dashboard, Monthly Summary, Categories views
├── style.css         # All styles — design tokens, components, responsive
├── app.js            # All logic — state, LocalStorage, rendering, events
└── .kiro/
    ├── steering/     # Kiro steering files (always, auto, manual, fileMatch)
    ├── agents/       # Custom agent definitions
    └── hooks/        # Automation hooks
```

## Key Constraints
- Only 1 CSS file (`style.css`)
- Only 1 JavaScript file (`app.js`)
- No backend — all data lives in `localStorage`
- No npm, no bundler, no framework

## Optional Challenges Implemented
1. Dark / light mode toggle (persisted to LocalStorage)
2. Monthly summary view with category bar chart
3. Custom categories (name, emoji, colour, type)

## Deployment
GitHub Pages — open `index.html` directly. Works in Chrome, Firefox, Edge, Safari.
