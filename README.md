# Nadia's Study (Static Site)

A clean, minimal author/writing site (no build step). Designed to deploy for free on **Cloudflare Pages**.

## Pages
- `/index.html` — Home (pinned + latest)
- `/writing.html` — All writing + tags + search
- `/fragments.html` — Short thoughts
- `/about.html`
- `/contact.html`

## Local preview
Just open `index.html` in a browser.

## Deploy to Cloudflare Pages (free)
1. Create a GitHub repo and push this folder.
2. Cloudflare Dashboard → **Pages** → **Create a project** → connect GitHub.
3. Framework preset: **None**
4. Build command: *(leave empty)*
5. Output directory: *(leave empty)* (or `/`)
6. Deploy.

Cloudflare will give you a free URL like: `https://<project>.pages.dev`

## Add / edit posts
Edit `posts.js` (it’s a simple array).
- `pinned: true` shows on the homepage Start Here section.
- `tags: [...]` power filters.
