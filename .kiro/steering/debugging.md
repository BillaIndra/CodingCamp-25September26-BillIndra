---
inclusion: manual
name: debugging
description: Troubleshooting guide for common FinanceFlow issues
---

# Debugging Guide

Load this file manually with `#debugging` in chat when you hit a bug.

## Common Issues

### Transactions not saving between page reloads
- Open DevTools → Application → Local Storage → check for `ff_transactions`
- If missing, check the browser isn't in private/incognito mode (LocalStorage disabled)
- Check `storage.set()` isn't throwing — wrap in try/catch already done

### Pie chart not showing
- Check the browser console for `Chart is not defined` — means Chart.js CDN failed to load
- Verify the `<script>` tag for Chart.js appears **before** `app.js` in index.html
- Check network tab — CDN URL: `https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js`
- `pieChartInstance` will be `null` if no expense transactions exist — this is expected

### Categories dropdown is empty
- `populateCategoryDropdown()` filters by `txType` value (`'expense'` or `'income'`)
- Check `DEFAULT_CATEGORIES` includes at least one entry matching the selected type
- Custom categories with `type: 'both'` should appear for either type

### Dark mode not persisting
- Check `ff_theme` key in LocalStorage → should be `"light"` or `"dark"`
- `applyTheme()` sets `data-theme` on `<html>` — inspect the element in DevTools
- Pie chart colours won't update until `pieChartInstance` is destroyed and recreated — `toggleTheme()` handles this

### Delete button not responding
- Transaction delete uses event delegation on `#txList` — check the button has `data-id` set
- Category delete checks `isDefault` — built-in categories have no delete button rendered

### Form shake not triggering
- `shake()` removes and re-adds the `.shake` class; it needs `void el.offsetWidth` to force reflow
- Check `@keyframes shake` exists in `style.css` section 20

## DevTools Quick Checks

```js
// See all transactions
JSON.parse(localStorage.getItem('ff_transactions'))

// Clear all data (full reset)
localStorage.clear(); location.reload();

// Check current theme
document.documentElement.getAttribute('data-theme')

// Inspect pie chart instance
window.pieChartInstance  // only accessible if not in strict module scope
```

## Adding Console Logging Temporarily
Wrap with a flag so it's easy to strip:
```js
const DEBUG = true;
if (DEBUG) console.log('renderAll called', state.transactions.length);
```
Remove `DEBUG` lines before committing.
