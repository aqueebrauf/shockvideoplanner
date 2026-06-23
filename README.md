# Shock Video Planner

Internal reel planning tool for editors — scripts, sequences, and reference resources. No login required.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Updating data

Resource data lives in JSON under `src/data/`. Edit these files (or use Cursor/scripts) and push to publish updates.

- **Screens** — `src/data/screens.json`
- **Hashtags** — `src/data/hashtags.json` (fields: `id`, `hashtag`, `posts`, `notes`, `category`)
- **Goals** — `src/data/goals.json` (fields: `id`, `title`, `link`)

## GitHub Pages setup

1. Push this project to GitHub.
2. Open **Settings → Pages → Build and deployment**.
3. Set **Source** to **Deploy from a branch**.
4. Set **Branch** to **`main`** and folder to **`/docs`** (not root).
5. Save. After 1–2 minutes the site is live at `https://<username>.github.io/<repo-name>/`.

Every push to `main` rebuilds the app and updates the `docs/` folder automatically.

## Project structure

```
src/
  data/           # JSON resources (edit to publish new data)
  pages/          # App screens
    resources/    # Resource sub-pages (Screens, Hashtags, …)
```
