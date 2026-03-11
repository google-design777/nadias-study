# Nadia's Study — Cloudflare Pages + Admin Panel

This is a clean, minimal writing site for **Nadia**, with a real **admin panel** at `/admin`.

## How posting works (admin panel)
- Nadia writes posts in `/admin`.
- Posts are saved as Markdown files in the GitHub repo (`src/posts/*.md`).
- Cloudflare Pages auto-builds the site and publishes to the real web.

## Tech
- Static site generator: **Eleventy (11ty)**
- CMS/admin: **Decap CMS** (formerly Netlify CMS)
- Hosting: **Cloudflare Pages** (free)
- Auth: GitHub OAuth via **Cloudflare Pages Functions** (`/api/auth` + `/api/callback`)

---

## Local preview
```bash
npm install
npm run build
npx @11ty/eleventy --serve
```

Output folder: `_site/`

## Add/edit posts (manual)
Edit or create Markdown files in:
- `src/posts/*.md`

Frontmatter example:
```yaml
---
title: "My Post"
date: 2026-03-11
pinned: false
mood: calm
tags: [Life, Mind]
excerpt: "Short teaser…"
---
```

---

## Deploy to Cloudflare Pages
### 1) Push to GitHub
Create a repo on GitHub and push this folder.

### 2) Create a GitHub OAuth App (for /admin login)
GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
- **Homepage URL:** `https://YOUR_PROJECT.pages.dev`
- **Authorization callback URL:** `https://YOUR_PROJECT.pages.dev/api/callback`

Copy the **Client ID** and generate a **Client Secret**.

### 3) Cloudflare Pages settings
Cloudflare Dashboard → Pages → your project → Settings → Environment variables
Add:
- `GITHUB_CLIENT_ID` = (from OAuth App)
- `GITHUB_CLIENT_SECRET` = (from OAuth App)

### 4) Cloudflare build settings
- Framework preset: **Eleventy** (or None)
- Build command: `npm run build`
- Output directory: `_site`

### 5) Configure Decap CMS
Edit `admin/config.yml`:
- `repo:` -> `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME`
- `base_url:` -> `https://YOUR_PROJECT.pages.dev`

Then visit:
- `https://YOUR_PROJECT.pages.dev/admin/`

## Restrict to only Nadia
Make the GitHub repo private (optional) and invite **Nadia’s GitHub user** as a collaborator with **Write** access.
Only collaborators can publish.
