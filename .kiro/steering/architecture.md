# Architecture & Data Flow

## State Management
All runtime data lives in a single `state` object in `app.js`.
Nothing is read directly from the DOM — the DOM is always derived from state.

```
state = {
  transactions:   [],      // persisted to localStorage
  categories:     [],      // defaults + custom (custom persisted)
  theme:          'light', // persisted
  spendingLimit:  null,    // persisted
  currentView:    'dashboard',
  summaryMonth:   { year, month },
  filterCategory: 'all',
  sortOrder:      'date-desc',
  searchQuery:    '',
}
```

## Data Persistence (LocalStorage)
| Key                  | Contents                        |
|----------------------|---------------------------------|
| `ff_transactions`    | Array of transaction objects    |
| `ff_categories`      | Array of custom categories only |
| `ff_theme`           | `'light'` or `'dark'`           |
| `ff_spending_limit`  | Number or null                  |

Built-in categories are defined as a constant (`DEFAULT_CATEGORIES`) and never persisted.
On load, saved custom categories are merged with the defaults.

## Transaction Object Shape
```js
{
  id:          'tx_<timestamp>_<random>',
  description: 'Grocery run',
  amount:      42.50,           // always positive
  type:        'expense',       // 'expense' | 'income'
  categoryId:  'cat_food',
  date:        '2026-10-02',    // ISO date string YYYY-MM-DD
}
```

## Category Object Shape
```js
{
  id:        'cat_food',
  name:      'Food',
  emoji:     '🍔',
  color:     '#ef4444',         // hex colour string
  type:      'expense',         // 'expense' | 'income' | 'both'
  isDefault: true,              // false for user-created categories
}
```

## Render Pipeline
Every mutation calls `renderAll()` which re-renders every component from state.
`renderPieChart()` uses a persistent Chart.js instance — it updates data in-place
rather than destroying and recreating the chart each time (smoother animation).

```
User action
  └─► mutate state + save to localStorage
        └─► renderAll()
              ├─ populateCategoryDropdown()
              ├─ populateFilterDropdown()
              ├─ renderSummaryCards()
              ├─ renderLimitBar()
              ├─ renderTransactionList()
              ├─ renderPieChart()        ← Chart.js doughnut
              ├─ renderCategoryList()
              └─ renderMonthlySummary()  ← only when summary view is active
```

## View System
Three views exist in the HTML: `#view-dashboard`, `#view-summary`, `#view-categories`.
Only one has the `active` class at a time. `switchView(name)` toggles both the nav tabs
and the view sections.

## Security
`escHtml()` sanitises every piece of user-supplied text before DOM insertion.
No `innerHTML` is used with raw user data.
