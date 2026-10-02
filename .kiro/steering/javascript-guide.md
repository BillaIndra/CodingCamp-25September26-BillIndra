---
inclusion: fileMatch
fileMatchPattern: "*.js"
---

# JavaScript File Guide

This steering file activates automatically when a `.js` file is open.

## app.js Section Map

| Section | What it does |
|---------|-------------|
| 1  | `STORAGE_KEYS` constants + `DEFAULT_CATEGORIES` array |
| 2  | `state` object — single source of truth |
| 3  | `storage` helper — safe LocalStorage get/set |
| 4  | `init()` — bootstraps app on DOMContentLoaded |
| 5  | DOM helpers: `el()`, `fmt()`, `uid()`, `formatDate()`, `hexToRgba()` |
| 6  | Theme: `applyTheme()`, `toggleTheme()` |
| 7  | Toast notifications: `showToast()` |
| 8  | Alert banner: `showAlert()`, `hideAlert()` |
| 9  | Category helpers: `getCategoryById()`, `getCategoriesForType()` |
| 10 | Dropdown populators: `populateCategoryDropdown()`, `populateFilterDropdown()` |
| 11 | Transaction CRUD: `addTransaction()`, `deleteTransaction()` |
| 12 | Derived totals: `getTotals()`, `getCurrentMonthExpenses()` |
| 13 | Filter + sort: `getFilteredSorted()` |
| 14 | Render: `renderSummaryCards()` |
| 15 | Render: `renderLimitBar()` |
| 16 | Render: `renderTransactionList()` |
| 17 | Render: `renderMonthlySummary()`, `renderCategoryChart()`, `renderMonthTxList()` |
| 18 | Render: `renderPieChart()` — Chart.js doughnut |
| 18b| Render: `renderCategoryList()` |
| 19 | `renderAll()` — calls every renderer |
| 20 | `switchView()` |
| 21 | Form handlers: `handleAddTransaction()`, `handleAddCategory()`, `handleSetLimit()` |
| 22 | Delete handlers: `handleDeleteTransaction()`, `handleDeleteCategory()` |
| 23 | Month navigation: `changeMonth()` |
| 24 | Security: `escHtml()` |
| 25 | UI helpers: `shake()` |
| 26 | `bindEvents()` — all event listener wiring |
| 27 | `DOMContentLoaded` → `init()` |

## Adding a New Feature — Checklist
1. Add any new state properties to the `state` object (section 2)
2. Add a `STORAGE_KEY` if the data needs to persist
3. Write a pure render function — reads from `state`, writes to DOM only
4. Call the render function from `renderAll()` (section 19)
5. Wire any new events in `bindEvents()` (section 26)
6. Never read form values outside of a handler function

## Chart.js Notes
- `pieChartInstance` is a module-level variable holding the Chart instance
- Always check `if (pieChartInstance)` before calling `.destroy()` or `.update()`
- When the theme changes, destroy and recreate — do not just update — so tooltip colours reset
- Chart type is `'doughnut'` with `cutout: '60%'`
