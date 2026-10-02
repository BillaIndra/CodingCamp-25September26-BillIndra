---
inclusion: manual
name: deployment
description: GitHub Pages deployment steps and checklist
---

# Deployment Guide

Load this with `#deployment` in chat when preparing to publish.

## Pre-deployment Checklist
- [ ] All three files present in repo root: `index.html`, `style.css`, `app.js`
- [ ] `.kiro/` folder committed (required for submission)
- [ ] Chart.js CDN `<script>` tag is present in `index.html` before `app.js`
- [ ] No hardcoded localhost URLs anywhere
- [ ] Tested in Chrome and Firefox with DevTools open — no console errors
- [ ] Tested with LocalStorage cleared (fresh state)
- [ ] Dark mode toggle works and persists on reload
- [ ] Pie chart renders after adding expense transactions
- [ ] GitHub repo is set to **Public**

## GitHub Desktop Steps
1. Open GitHub Desktop
2. **File → Add Local Repository** → select `C:\kiro\finance-tracker`
3. If prompted to init: click **"create a repository"**, name it `finance-tracker`
4. Write a commit message: `Initial commit — FinanceFlow tracker`
5. Click **Commit to main**
6. Click **Publish repository** → uncheck "Keep private" → **Publish**

## Enable GitHub Pages
1. Go to `https://github.com/YOUR-USERNAME/finance-tracker`
2. **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: `main` / Folder: `/ (root)`
5. Click **Save**
6. Wait ~2 minutes → site live at `https://YOUR-USERNAME.github.io/finance-tracker`

## Submission Items
| Item | Details |
|------|---------|
| AWS Builder ID | Email used at profile.aws.amazon.com |
| GitHub Repo URL | `https://github.com/YOUR-USERNAME/finance-tracker` |
| Live Site URL | `https://YOUR-USERNAME.github.io/finance-tracker` |

## After Publishing — Quick Smoke Test
Open the live URL and verify:
- Page loads without a blank screen
- Adding a transaction updates the balance cards
- Pie chart appears after adding an expense
- Dark/light toggle works
- Monthly summary view shows data
- Refreshing the page keeps all data intact
