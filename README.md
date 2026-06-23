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

1. Create a repo on GitHub and push this project.
2. In the repo: **Settings → Pages → Build and deployment**
   - **Source:** Deploy from a branch
   - **Branch:** `gh-pages` / `/ (root)`
3. Push to `main`. The workflow builds `dist` and publishes it to the `gh-pages` branch.

The site will be at `https://<username>.github.io/<repo-name>/`.

## Project structure

```
src/
  data/           # JSON resources (edit to publish new data)
  pages/          # App screens
    resources/    # Resource sub-pages (Screens, Hashtags, …)
```
