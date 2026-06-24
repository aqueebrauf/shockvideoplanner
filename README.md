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
- **Goals** — `src/data/goals.json` (fields: `id`, `title`, `date`, `link`)
- **CTAs** — `src/data/ctas.json` (fields: `id`, `text`)

## GitHub Pages setup

1. Push to `main`. GitHub Actions builds the app and publishes to the **`gh-pages`** branch.
2. Open **Settings → Pages → Build and deployment**.
3. Set **Source** to **Deploy from a branch**.
4. Set **Branch** to **`gh-pages`** and folder **`/ (root)`**.
5. Save. Site URL: `https://<username>.github.io/<repo-name>/`

`main` holds source code only. The live site is built automatically — no build files committed to `main`.

## Project structure

```
src/
  data/           # JSON resources (edit to publish new data)
  pages/          # App screens
    resources/    # Resource sub-pages (Screens, Hashtags, …)
```
