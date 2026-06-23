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

## GitHub Pages setup

1. Create a repo on GitHub and push this project.
2. In the repo: **Settings → Pages → Build and deployment → Source** → select **GitHub Actions**.
3. Push to `main`. The workflow builds and deploys automatically.

The site will be at `https://<username>.github.io/<repo-name>/`.

## Project structure

```
src/
  data/           # JSON resources (edit to publish new data)
  pages/          # App screens
    resources/    # Resource sub-pages (Screens, Hashtags, …)
```
