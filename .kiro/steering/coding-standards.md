# Coding Standards

These rules apply to every file in this project.

## JavaScript
- Always use `'use strict'` at the top of `app.js`
- Use `const` by default; `let` only when reassignment is needed; never `var`
- All user-supplied text must pass through `escHtml()` before being inserted into the DOM
- LocalStorage keys must use the `ff_` prefix (defined in `STORAGE_KEYS`)
- Functions must be named clearly in verb-noun form: `renderPieChart`, `handleAddTransaction`
- Event listeners use delegation on parent containers where possible — do NOT attach listeners inside loops
- No inline `onclick` / `oninput` attributes in HTML — all listeners wired in `bindEvents()`
- Keep all state in the single `state` object — no scattered globals

## CSS
- All colours, spacing, and radii must use CSS custom properties defined in `:root`
- Dark mode overrides go inside `[data-theme="dark"]` — never use `prefers-color-scheme` directly
- Class names use BEM-style kebab-case: `.tx-item`, `.card--balance`, `.pie-legend-dot`
- Avoid `!important` — increase specificity instead
- Media queries use `max-width` breakpoints: 900px (tablet), 640px (mobile), 400px (small)

## HTML
- One `<link>` to `style.css`, one `<script>` to `app.js` — no additional files
- All interactive elements need an `aria-label` when the visible label is not sufficient
- Use semantic elements: `<header>`, `<main>`, `<section>`, `<aside>`, `<nav>`, `<ul>`, `<form>`
- IDs are unique, used only for JS hooks — styling targets use classes

## General
- No commented-out dead code in committed files
- Section headers in `app.js` and `style.css` use the established banner style
- Keep functions small and single-purpose — if a function exceeds ~40 lines, consider splitting it
