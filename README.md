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

## Netlify deployment

1. Connect this repo in [Netlify](https://app.netlify.com) (Build command: `npm run build`, Publish directory: `dist` — or use the included `netlify.toml`).
2. Under **Site configuration → Environment variables**, add:
   - `VITE_ANTHROPIC_API_KEY` — your Anthropic API key
3. **Redeploy** after adding or changing env vars (build-time variables are baked into the bundle).
4. Push to `main` — Netlify rebuilds automatically.

Local dev: copy `.env.example` to `.env.local` and set `VITE_ANTHROPIC_API_KEY`.

## Project structure

```
src/
  data/           # JSON resources (edit to publish new data)
  pages/          # App screens
    resources/    # Resource sub-pages (Screens, Hashtags, …)
```
