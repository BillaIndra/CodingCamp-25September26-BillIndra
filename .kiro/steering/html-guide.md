---
inclusion: fileMatch
fileMatchPattern: "*.html"
---

# HTML File Guide

This steering file activates automatically when an `.html` file is open.

## index.html Structure

```
<html data-theme="light">
  <head>
    Inter font (Google Fonts)
    style.css
  </head>
  <body>
    <header.site-header>          ← sticky nav, logo, view tabs, theme toggle
    <main.main-content>
      #alertBanner                ← spending limit warning (hidden by default)

      #view-dashboard  .view.active
        .cards-row                ← 4 summary cards
        #pieChartPanel            ← Chart.js doughnut + legend
        #limitBarWrap             ← progress bar (hidden until limit set)
        .dashboard-grid
          aside.panel--form       ← Add Transaction form + Limit setter
          section.panel--list     ← filter/sort/search + #txList

      #view-summary  .view
        .view-header + month nav
        .cards-row                ← income / expense / net for the month
        .panel                    ← CSS bar chart (#categoryChart)
        .panel                    ← monthly tx list (#summaryTxList)

      #view-categories  .view
        .dashboard-grid
          aside.panel--form       ← Add Category form
          section.panel           ← #catList

    #toast                        ← fixed bottom-right notification

    Chart.js CDN script
    app.js
  </body>
```

## ID Reference (used by JS)

### Dashboard
| ID | Element |
|----|---------|
| `totalBalance` | Net balance card amount |
| `totalIncome` | Income card amount |
| `totalExpense` | Expense card amount |
| `savingsRate` | Savings rate card amount |
| `balanceTrend` | Balance card sub-text |
| `incomeCount` | Income transaction count |
| `expenseCount` | Expense transaction count |
| `spendingPieChart` | `<canvas>` for Chart.js |
| `pieEmpty` | Empty overlay on chart |
| `pieLegend` | `<ul>` legend beside chart |
| `limitBarWrap` | Spending limit progress container |
| `limitBarLabel` | "spent / limit" text |
| `limitProgress` | Progress fill div |
| `alertBanner` | Warning banner |
| `alertMessage` | Banner text |
| `alertClose` | Banner dismiss button |

### Form inputs
| ID | Field |
|----|-------|
| `txDescription` | Item name |
| `txAmount` | Amount |
| `txType` | Income / Expense select |
| `txCategory` | Category select (populated by JS) |
| `txDate` | Date picker |
| `spendingLimit` | Monthly limit number input |
| `setLimitBtn` | Set limit button |
| `transactionForm` | The whole form |

### Transaction list
| ID | Element |
|----|---------|
| `txList` | `<ul>` of transaction items |
| `emptyState` | Empty placeholder |
| `filterCategory` | Category filter select |
| `sortSelect` | Sort order select |
| `searchInput` | Live search input |

### Monthly summary view
| ID | Element |
|----|---------|
| `monthLabel` | "October 2026" label |
| `prevMonth` / `nextMonth` | Navigation buttons |
| `summaryIncome` | Monthly income card |
| `summaryExpense` | Monthly expense card |
| `summaryNet` | Monthly net card |
| `categoryChart` | CSS bar chart container |
| `summaryTxList` | Monthly tx list |
| `summaryEmpty` | Empty placeholder |

### Categories view
| ID | Element |
|----|---------|
| `catList` | `<ul>` of category items |
| `catName` | Name input |
| `catEmoji` | Emoji input |
| `catColor` | Colour picker |
| `catType` | Type select |
| `categoryForm` | The whole form |

### Global
| ID | Element |
|----|---------|
| `themeToggle` | ☀️/🌙 toggle button |
| `toast` | Toast notification div |
