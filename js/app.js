/* ═══════════════════════════════════════════════════════════════
   FinanceFlow — app.js
   Vanilla JS · LocalStorage · No frameworks
   Optional challenges: custom categories, monthly summary, dark/light mode
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────
   1. CONSTANTS & STORAGE KEYS
────────────────────────────────────────── */
const STORAGE_KEYS = {
  TRANSACTIONS: 'ff_transactions',
  CATEGORIES:   'ff_categories',
  THEME:        'ff_theme',
  LIMIT:        'ff_spending_limit',
};

/** Default built-in categories (cannot be deleted) */
const DEFAULT_CATEGORIES = [
  { id: 'cat_salary',      name: 'Salary',       emoji: '💼', color: '#10b981', type: 'income',  isDefault: true },
  { id: 'cat_freelance',   name: 'Freelance',     emoji: '💻', color: '#6366f1', type: 'income',  isDefault: true },
  { id: 'cat_investment',  name: 'Investment',    emoji: '📈', color: '#f59e0b', type: 'income',  isDefault: true },
  { id: 'cat_food',        name: 'Food',          emoji: '🍔', color: '#ef4444', type: 'expense', isDefault: true },
  { id: 'cat_transport',   name: 'Transport',     emoji: '🚗', color: '#3b82f6', type: 'expense', isDefault: true },
  { id: 'cat_housing',     name: 'Housing',       emoji: '🏠', color: '#8b5cf6', type: 'expense', isDefault: true },
  { id: 'cat_health',      name: 'Health',        emoji: '🏥', color: '#ec4899', type: 'expense', isDefault: true },
  { id: 'cat_shopping',    name: 'Shopping',      emoji: '🛍️', color: '#f97316', type: 'expense', isDefault: true },
  { id: 'cat_entertainment',name: 'Entertainment',emoji: '🎬', color: '#a855f7', type: 'expense', isDefault: true },
  { id: 'cat_utilities',   name: 'Utilities',     emoji: '💡', color: '#14b8a6', type: 'expense', isDefault: true },
  { id: 'cat_education',   name: 'Education',     emoji: '📚', color: '#0ea5e9', type: 'expense', isDefault: true },
  { id: 'cat_other',       name: 'Other',         emoji: '📦', color: '#6b7280', type: 'both',    isDefault: true },
];


/* ──────────────────────────────────────────
   2. STATE
────────────────────────────────────────── */
let state = {
  transactions: [],
  categories:   [],
  theme:        'light',
  spendingLimit: null,
  currentView:  'dashboard',
  summaryMonth: null,   // { year, month } — 0-indexed month
  filterCategory: 'all',
  sortOrder:    'date-desc',
  searchQuery:  '',
};


/* ──────────────────────────────────────────
   3. LOCAL STORAGE HELPERS
────────────────────────────────────────── */
const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
};


/* ──────────────────────────────────────────
   4. INITIALISE APP
────────────────────────────────────────── */
function init() {
  // Load persisted data
  state.transactions  = storage.get(STORAGE_KEYS.TRANSACTIONS, []);
  state.spendingLimit = storage.get(STORAGE_KEYS.LIMIT, null);
  state.theme         = storage.get(STORAGE_KEYS.THEME, 'light');

  // Merge saved custom categories with defaults
  const savedCustom = storage.get(STORAGE_KEYS.CATEGORIES, []);
  state.categories = [
    ...DEFAULT_CATEGORIES,
    ...savedCustom.filter(c => !c.isDefault),
  ];

  // Set today's date as default in the form
  const today = new Date().toISOString().split('T')[0];
  el('txDate').value = today;

  // Summary starts at current month
  const now = new Date();
  state.summaryMonth = { year: now.getFullYear(), month: now.getMonth() };

  // Apply saved theme
  applyTheme(state.theme);

  // Wire up all event listeners
  bindEvents();

  // Render everything
  renderAll();
}


/* ──────────────────────────────────────────
   5. DOM HELPERS
────────────────────────────────────────── */
const el    = id => document.getElementById(id);
const qs    = (sel, ctx = document) => ctx.querySelector(sel);
const qsa   = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const fmt   = n => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtSigned = n => (n >= 0 ? '+' : '-') + fmt(Math.abs(n));
const uid   = () => 'tx_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
const catUid = () => 'cat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}


/* ──────────────────────────────────────────
   6. THEME — OPTIONAL CHALLENGE ①
────────────────────────────────────────── */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  state.theme = theme;
  storage.set(STORAGE_KEYS.THEME, theme);
}

function toggleTheme() {
  applyTheme(state.theme === 'light' ? 'dark' : 'light');
  // Destroy and re-create chart so tooltip/border colours update
  if (pieChartInstance) {
    pieChartInstance.destroy();
    pieChartInstance = null;
  }
  renderPieChart();
}


/* ──────────────────────────────────────────
   7. TOAST NOTIFICATIONS
────────────────────────────────────────── */
let toastTimer = null;

function showToast(msg) {
  const t = el('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}


/* ──────────────────────────────────────────
   8. ALERT BANNER (spending limit)
────────────────────────────────────────── */
function showAlert(msg) {
  el('alertMessage').textContent = msg;
  el('alertBanner').removeAttribute('hidden');
}

function hideAlert() {
  el('alertBanner').setAttribute('hidden', '');
}


/* ──────────────────────────────────────────
   9. CATEGORY HELPERS
────────────────────────────────────────── */
function getCategoryById(id) {
  return state.categories.find(c => c.id === id) || null;
}

function getCategoriesForType(type) {
  // type = 'income' | 'expense'
  return state.categories.filter(c => c.type === type || c.type === 'both');
}

function saveCustomCategories() {
  const custom = state.categories.filter(c => !c.isDefault);
  storage.set(STORAGE_KEYS.CATEGORIES, custom);
}


/* ──────────────────────────────────────────
   10. POPULATE CATEGORY DROPDOWNS
────────────────────────────────────────── */
function populateCategoryDropdown() {
  const typeSelect = el('txType');
  const catSelect  = el('txCategory');
  const type       = typeSelect.value; // 'expense' | 'income'

  const cats = getCategoriesForType(type);
  catSelect.innerHTML = cats
    .map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`)
    .join('');
}

function populateFilterDropdown() {
  const sel = el('filterCategory');
  const current = sel.value;
  sel.innerHTML = '<option value="all">All Categories</option>'
    + state.categories.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');
  // Restore selection if still valid
  if ([...sel.options].some(o => o.value === current)) sel.value = current;
}


/* ──────────────────────────────────────────
   11. TRANSACTIONS — CRUD
────────────────────────────────────────── */
function addTransaction(tx) {
  state.transactions.unshift(tx);
  storage.set(STORAGE_KEYS.TRANSACTIONS, state.transactions);
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter(tx => tx.id !== id);
  storage.set(STORAGE_KEYS.TRANSACTIONS, state.transactions);
}


/* ──────────────────────────────────────────
   12. DERIVED TOTALS
────────────────────────────────────────── */
function getTotals(txList = state.transactions) {
  let income = 0, expense = 0;
  txList.forEach(tx => {
    if (tx.type === 'income')  income  += tx.amount;
    if (tx.type === 'expense') expense += tx.amount;
  });
  return { income, expense, balance: income - expense };
}

/** Expense total for the current calendar month */
function getCurrentMonthExpenses() {
  const now = new Date();
  return state.transactions
    .filter(tx => {
      if (tx.type !== 'expense') return false;
      const d = new Date(tx.date + 'T00:00:00');
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
}


/* ──────────────────────────────────────────
   13. SORT & FILTER TRANSACTIONS
────────────────────────────────────────── */
function getFilteredSorted() {
  let list = [...state.transactions];

  // Search
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter(tx =>
      tx.description.toLowerCase().includes(q) ||
      (getCategoryById(tx.categoryId)?.name || '').toLowerCase().includes(q)
    );
  }

  // Category filter
  if (state.filterCategory !== 'all') {
    list = list.filter(tx => tx.categoryId === state.filterCategory);
  }

  // Sort — OPTIONAL CHALLENGE: sort by amount
  switch (state.sortOrder) {
    case 'date-desc':   list.sort((a, b) => b.date.localeCompare(a.date)); break;
    case 'date-asc':    list.sort((a, b) => a.date.localeCompare(b.date)); break;
    case 'amount-desc': list.sort((a, b) => b.amount - a.amount); break;
    case 'amount-asc':  list.sort((a, b) => a.amount - b.amount); break;
  }

  return list;
}


/* ──────────────────────────────────────────
   14. RENDER — DASHBOARD CARDS
────────────────────────────────────────── */
function renderSummaryCards() {
  const { income, expense, balance } = getTotals();

  el('totalBalance').textContent = fmt(balance);
  el('totalIncome').textContent  = fmt(income);
  el('totalExpense').textContent = fmt(expense);

  const incomeCount   = state.transactions.filter(t => t.type === 'income').length;
  const expenseCount  = state.transactions.filter(t => t.type === 'expense').length;
  el('incomeCount').textContent  = `${incomeCount} transaction${incomeCount !== 1 ? 's' : ''}`;
  el('expenseCount').textContent = `${expenseCount} transaction${expenseCount !== 1 ? 's' : ''}`;

  const rate = income > 0 ? Math.round((balance / income) * 100) : 0;
  el('savingsRate').textContent = Math.max(0, rate) + '%';

  el('balanceTrend').textContent = balance >= 0 ? '▲ In the green' : '▼ Spending more than earning';
}


/* ──────────────────────────────────────────
   15. RENDER — SPENDING LIMIT BAR
           OPTIONAL CHALLENGE: highlight spending over limit
────────────────────────────────────────── */
function renderLimitBar() {
  const wrap = el('limitBarWrap');

  if (!state.spendingLimit) {
    wrap.classList.remove('visible');
    hideAlert();
    return;
  }

  wrap.classList.add('visible');
  const spent   = getCurrentMonthExpenses();
  const limit   = state.spendingLimit;
  const pct     = Math.min((spent / limit) * 100, 100);
  const fill    = el('limitProgress');

  el('limitBarLabel').textContent = `${fmt(spent)} / ${fmt(limit)}`;
  fill.style.width = pct + '%';
  fill.classList.remove('warn', 'danger');

  if (pct >= 100) {
    fill.classList.add('danger');
    showAlert(`🚨 You've exceeded your monthly spending limit of ${fmt(limit)}! Current spend: ${fmt(spent)}.`);
  } else if (pct >= 80) {
    fill.classList.add('warn');
    showAlert(`⚠️ You're at ${Math.round(pct)}% of your ${fmt(limit)} monthly limit. ${fmt(limit - spent)} remaining.`);
  } else {
    hideAlert();
  }
}


/* ──────────────────────────────────────────
   16. RENDER — TRANSACTION LIST
────────────────────────────────────────── */
function renderTransactionList() {
  const list     = getFilteredSorted();
  const listEl   = el('txList');
  const emptyEl  = el('emptyState');
  const limit    = state.spendingLimit;

  listEl.innerHTML = '';

  if (list.length === 0) {
    emptyEl.classList.add('visible');
    return;
  }

  emptyEl.classList.remove('visible');

  list.forEach(tx => {
    const cat   = getCategoryById(tx.categoryId);
    const emoji = cat?.emoji || '📦';
    const color = cat?.color || '#6b7280';
    const catName = cat?.name || 'Other';

    // Flag over-limit expense transactions
    const overLimit = limit && tx.type === 'expense' && tx.amount > limit * 0.5;

    const li = document.createElement('li');
    li.className = 'tx-item' + (overLimit ? ' over-limit' : '');
    li.setAttribute('role', 'listitem');
    li.dataset.id = tx.id;

    li.innerHTML = `
      <div class="tx-icon ${tx.type}" style="background:${hexToRgba(color, 0.15)};">
        ${emoji}
      </div>
      <div class="tx-info">
        <div class="tx-desc">${escHtml(tx.description)}</div>
        <div class="tx-meta">
          <span class="tx-cat-badge" style="border-color:${color}30;color:${color};">
            ${emoji} ${escHtml(catName)}
          </span>
          <span>${formatDate(tx.date)}</span>
        </div>
      </div>
      <div class="tx-amount ${tx.type}">
        ${tx.type === 'income' ? '+' : '-'}${fmt(tx.amount)}
      </div>
      <button class="tx-delete" data-id="${tx.id}" aria-label="Delete transaction">✕</button>
    `;

    listEl.appendChild(li);
  });
}


/* ──────────────────────────────────────────
   17. RENDER — MONTHLY SUMMARY VIEW
           OPTIONAL CHALLENGE: monthly summary
────────────────────────────────────────── */
function renderMonthlySummary() {
  const { year, month } = state.summaryMonth;

  // Month label
  const label = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  el('monthLabel').textContent = label;

  // Filter transactions for this month
  const monthTxs = state.transactions.filter(tx => {
    const d = new Date(tx.date + 'T00:00:00');
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const { income, expense, balance } = getTotals(monthTxs);

  el('summaryIncome').textContent  = fmt(income);
  el('summaryExpense').textContent = fmt(expense);
  el('summaryNet').textContent     = fmtSigned(balance);
  el('summaryNet').style.color     = balance >= 0 ? 'var(--income-text)' : 'var(--expense-text)';

  // Category breakdown chart
  const expTxs = monthTxs.filter(tx => tx.type === 'expense');
  renderCategoryChart(expTxs);

  // Monthly tx list
  renderMonthTxList(monthTxs);
}

function renderCategoryChart(expTxs) {
  const chartEl = el('categoryChart');

  if (expTxs.length === 0) {
    chartEl.innerHTML = '<div class="chart-empty">No expense data for this month.</div>';
    return;
  }

  // Aggregate by category
  const byCategory = {};
  expTxs.forEach(tx => {
    byCategory[tx.categoryId] = (byCategory[tx.categoryId] || 0) + tx.amount;
  });

  const total = Object.values(byCategory).reduce((s, v) => s + v, 0);
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  chartEl.innerHTML = sorted.map(([catId, amount]) => {
    const cat   = getCategoryById(catId);
    const emoji = cat?.emoji || '📦';
    const name  = cat?.name  || 'Other';
    const color = cat?.color || '#6b7280';
    const pct   = total > 0 ? (amount / total) * 100 : 0;

    return `
      <div class="chart-bar-row">
        <div class="chart-label" title="${escHtml(name)}">${emoji} ${escHtml(name)}</div>
        <div class="chart-track">
          <div class="chart-fill" style="width:${pct.toFixed(1)}%;background:${color};"></div>
        </div>
        <div class="chart-value">${fmt(amount)}</div>
      </div>
    `;
  }).join('');
}

function renderMonthTxList(monthTxs) {
  const listEl  = el('summaryTxList');
  const emptyEl = el('summaryEmpty');
  listEl.innerHTML = '';

  if (monthTxs.length === 0) {
    emptyEl.classList.add('visible');
    return;
  }

  emptyEl.classList.remove('visible');

  // Sort newest first for display
  const sorted = [...monthTxs].sort((a, b) => b.date.localeCompare(a.date));

  sorted.forEach(tx => {
    const cat   = getCategoryById(tx.categoryId);
    const emoji = cat?.emoji || '📦';
    const color = cat?.color || '#6b7280';
    const catName = cat?.name || 'Other';

    const li = document.createElement('li');
    li.className = 'tx-item';

    li.innerHTML = `
      <div class="tx-icon ${tx.type}" style="background:${hexToRgba(color, 0.15)};">
        ${emoji}
      </div>
      <div class="tx-info">
        <div class="tx-desc">${escHtml(tx.description)}</div>
        <div class="tx-meta">
          <span class="tx-cat-badge" style="border-color:${color}30;color:${color};">
            ${emoji} ${escHtml(catName)}
          </span>
          <span>${formatDate(tx.date)}</span>
        </div>
      </div>
      <div class="tx-amount ${tx.type}">
        ${tx.type === 'income' ? '+' : '-'}${fmt(tx.amount)}
      </div>
    `;

    listEl.appendChild(li);
  });
}


/* ──────────────────────────────────────────
   18. RENDER — PIE CHART (dashboard)
        Uses Chart.js loaded via CDN
────────────────────────────────────────── */

/** Holds the Chart.js instance so we can update rather than recreate it */
let pieChartInstance = null;

function renderPieChart() {
  const canvas   = el('spendingPieChart');
  const emptyEl  = el('pieEmpty');
  const legendEl = el('pieLegend');

  // Aggregate ALL expense transactions by category
  const byCategory = {};
  state.transactions.forEach(tx => {
    if (tx.type !== 'expense') return;
    byCategory[tx.categoryId] = (byCategory[tx.categoryId] || 0) + tx.amount;
  });

  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const total   = entries.reduce((s, [, v]) => s + v, 0);

  // ── No data state ──────────────────────
  if (entries.length === 0) {
    emptyEl.classList.remove('hidden');
    legendEl.innerHTML = '';
    if (pieChartInstance) {
      pieChartInstance.destroy();
      pieChartInstance = null;
    }
    return;
  }

  emptyEl.classList.add('hidden');

  const labels = entries.map(([id]) => {
    const cat = getCategoryById(id);
    return (cat?.emoji ? cat.emoji + ' ' : '') + (cat?.name || 'Other');
  });
  const data   = entries.map(([, v]) => v);
  const colors = entries.map(([id]) => getCategoryById(id)?.color || '#6b7280');

  // Detect current theme for chart colours
  const isDark    = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#6b7280';
  const borderCol = isDark ? '#1a1d27' : '#ffffff';

  // ── Build / update Chart.js ────────────
  if (pieChartInstance) {
    // Update existing chart in-place (smooth animation)
    pieChartInstance.data.labels                       = labels;
    pieChartInstance.data.datasets[0].data             = data;
    pieChartInstance.data.datasets[0].backgroundColor  = colors;
    pieChartInstance.data.datasets[0].borderColor      = borderCol;
    pieChartInstance.options.plugins.legend.labels.color = textColor;
    pieChartInstance.update('active');
  } else {
    const ctx = canvas.getContext('2d');
    pieChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor:      borderCol,
          borderWidth:      3,
          hoverOffset:      10,
          hoverBorderWidth: 4,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        cutout:              '60%',
        animation: { animateScale: true, duration: 600 },
        plugins: {
          legend: { display: false },   // we render our own legend below
          tooltip: {
            callbacks: {
              label(ctx) {
                const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                return `  ${fmt(ctx.parsed)}  (${pct}%)`;
              },
            },
            backgroundColor: isDark ? '#22263a' : '#1e293b',
            titleColor:      '#f1f5f9',
            bodyColor:       '#cbd5e1',
            borderColor:     isDark ? '#2e3348' : '#334155',
            borderWidth:     1,
            padding:         10,
            cornerRadius:    8,
          },
        },
      },
    });
  }

  // ── Custom legend ──────────────────────
  legendEl.innerHTML = entries.map(([id, amount]) => {
    const cat  = getCategoryById(id);
    const name = cat?.name  || 'Other';
    const col  = cat?.color || '#6b7280';
    const emoji = cat?.emoji || '';
    const pct  = total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0';

    return `
      <li class="pie-legend-item" role="listitem">
        <span class="pie-legend-dot" style="background:${col};"></span>
        <span class="pie-legend-name">${emoji} ${escHtml(name)}</span>
        <span class="pie-legend-pct">${pct}%</span>
        <span class="pie-legend-amt">${fmt(amount)}</span>
      </li>
    `;
  }).join('');
}


/* ──────────────────────────────────────────
   18b. RENDER — CATEGORIES VIEW
────────────────────────────────────────── */
function renderCategoryList() {
  const listEl = el('catList');
  listEl.innerHTML = '';

  state.categories.forEach(cat => {
    const li = document.createElement('li');
    li.className = 'cat-item';
    li.dataset.id = cat.id;

    li.innerHTML = `
      <div class="cat-swatch" style="background:${hexToRgba(cat.color, 0.18)};color:${cat.color};">
        ${cat.emoji}
      </div>
      <div class="cat-info">
        <div class="cat-name">${escHtml(cat.name)}</div>
        <div class="cat-type">${cat.type === 'both' ? 'income & expense' : cat.type}</div>
      </div>
      ${cat.isDefault
        ? '<span class="cat-badge-default">Built-in</span>'
        : `<button class="cat-delete" data-id="${cat.id}" aria-label="Delete category ${escHtml(cat.name)}">✕</button>`
      }
    `;

    listEl.appendChild(li);
  });
}


/* ──────────────────────────────────────────
   19. RENDER ALL
────────────────────────────────────────── */
function renderAll() {
  populateCategoryDropdown();
  populateFilterDropdown();
  renderSummaryCards();
  renderLimitBar();
  renderTransactionList();
  renderPieChart();
  renderCategoryList();
  if (state.currentView === 'summary') renderMonthlySummary();
}


/* ──────────────────────────────────────────
   20. VIEW SWITCHING
────────────────────────────────────────── */
function switchView(viewName) {
  state.currentView = viewName;

  // Toggle active tab
  qsa('.btn-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  // Toggle active view section
  qsa('.view').forEach(sec => {
    sec.classList.toggle('active', sec.id === `view-${viewName}`);
  });

  if (viewName === 'summary') renderMonthlySummary();
}


/* ──────────────────────────────────────────
   21. FORM HANDLERS
────────────────────────────────────────── */
function handleAddTransaction(e) {
  e.preventDefault();

  const desc   = el('txDescription').value.trim();
  const amount = parseFloat(el('txAmount').value);
  const type   = el('txType').value;
  const catId  = el('txCategory').value;
  const date   = el('txDate').value;

  // Validation
  if (!desc) {
    shake(el('txDescription'));
    showToast('Please enter a description.');
    return;
  }
  if (!amount || amount <= 0) {
    shake(el('txAmount'));
    showToast('Please enter a valid amount.');
    return;
  }
  if (!date) {
    shake(el('txDate'));
    showToast('Please pick a date.');
    return;
  }

  const tx = { id: uid(), description: desc, amount, type, categoryId: catId, date };
  addTransaction(tx);

  // Reset form (keep type, date, category)
  el('txDescription').value = '';
  el('txAmount').value      = '';

  showToast(`${type === 'income' ? '💚' : '💸'} Transaction added!`);
  renderAll();
}

function handleAddCategory(e) {
  e.preventDefault();

  const name  = el('catName').value.trim();
  const emoji = el('catEmoji').value.trim() || '📦';
  const color = el('catColor').value;
  const type  = el('catType').value;

  if (!name) {
    shake(el('catName'));
    showToast('Please enter a category name.');
    return;
  }

  // Prevent duplicate names
  const exists = state.categories.some(c => c.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    shake(el('catName'));
    showToast('A category with that name already exists.');
    return;
  }

  const cat = { id: catUid(), name, emoji, color, type, isDefault: false };
  state.categories.push(cat);
  saveCustomCategories();

  el('catName').value  = '';
  el('catEmoji').value = '';
  el('catColor').value = '#6366f1';

  showToast(`✨ Category "${name}" added!`);
  renderAll();
}

function handleSetLimit() {
  const val = parseFloat(el('spendingLimit').value);
  if (!val || val <= 0) {
    shake(el('spendingLimit'));
    showToast('Enter a valid spending limit.');
    return;
  }
  state.spendingLimit = val;
  storage.set(STORAGE_KEYS.LIMIT, val);
  el('spendingLimit').value = '';
  showToast(`🎯 Monthly spending limit set to ${fmt(val)}`);
  renderLimitBar();
}


/* ──────────────────────────────────────────
   22. DELETE HANDLERS
────────────────────────────────────────── */
function handleDeleteTransaction(id) {
  deleteTransaction(id);
  showToast('Transaction removed.');
  renderAll();
}

function handleDeleteCategory(id) {
  // Check if any transaction uses this category
  const inUse = state.transactions.some(tx => tx.categoryId === id);
  if (inUse) {
    showToast('Cannot delete — category is used by existing transactions.');
    return;
  }
  state.categories = state.categories.filter(c => c.id !== id);
  saveCustomCategories();
  showToast('Category removed.');
  renderAll();
}


/* ──────────────────────────────────────────
   23. MONTH NAVIGATION (summary view)
────────────────────────────────────────── */
function changeMonth(delta) {
  let { year, month } = state.summaryMonth;
  month += delta;
  if (month > 11) { month = 0;  year++; }
  if (month <  0) { month = 11; year--; }
  state.summaryMonth = { year, month };
  renderMonthlySummary();
}


/* ──────────────────────────────────────────
   24. SECURITY HELPER
────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}


/* ──────────────────────────────────────────
   25. UI HELPERS
────────────────────────────────────────── */
function shake(inputEl) {
  inputEl.classList.remove('shake');
  void inputEl.offsetWidth; // force reflow
  inputEl.classList.add('shake');
  inputEl.addEventListener('animationend', () => inputEl.classList.remove('shake'), { once: true });
}


/* ──────────────────────────────────────────
   26. EVENT BINDINGS
────────────────────────────────────────── */
function bindEvents() {

  /* ── Navigation tabs ── */
  qsa('.btn-tab').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  /* ── Theme toggle ── */
  el('themeToggle').addEventListener('click', toggleTheme);

  /* ── Transaction form ── */
  el('transactionForm').addEventListener('submit', handleAddTransaction);

  /* ── Update categories when type changes ── */
  el('txType').addEventListener('change', populateCategoryDropdown);

  /* ── Delete transaction (event delegation) ── */
  el('txList').addEventListener('click', e => {
    const btn = e.target.closest('.tx-delete');
    if (btn) handleDeleteTransaction(btn.dataset.id);
  });

  /* ── Filter / sort controls ── */
  el('filterCategory').addEventListener('change', e => {
    state.filterCategory = e.target.value;
    renderTransactionList();
  });

  el('sortSelect').addEventListener('change', e => {
    state.sortOrder = e.target.value;
    renderTransactionList();
  });

  /* ── Search ── */
  el('searchInput').addEventListener('input', e => {
    state.searchQuery = e.target.value.trim();
    renderTransactionList();
  });

  /* ── Spending limit ── */
  el('setLimitBtn').addEventListener('click', handleSetLimit);
  el('spendingLimit').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSetLimit();
  });

  /* ── Alert close ── */
  el('alertClose').addEventListener('click', hideAlert);

  /* ── Category form ── */
  el('categoryForm').addEventListener('submit', handleAddCategory);

  /* ── Delete category (event delegation) ── */
  el('catList').addEventListener('click', e => {
    const btn = e.target.closest('.cat-delete');
    if (btn) handleDeleteCategory(btn.dataset.id);
  });

  /* ── Monthly nav ── */
  el('prevMonth').addEventListener('click', () => changeMonth(-1));
  el('nextMonth').addEventListener('click', () => changeMonth(+1));

  /* ── Keyboard shortcut: 'T' to focus description, 'D' for dashboard ── */
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 't' || e.key === 'T') {
      switchView('dashboard');
      el('txDescription').focus();
    }
    if (e.key === 'd' || e.key === 'D') switchView('dashboard');
    if (e.key === 'm' || e.key === 'M') switchView('summary');
    if (e.key === 'c' || e.key === 'C') switchView('categories');
  });
}


/* ──────────────────────────────────────────
   27. KICK-OFF
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', init);
