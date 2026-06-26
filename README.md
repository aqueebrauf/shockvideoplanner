# Shock Video Planner

Internal reel planning tool for editors — scripts, sequences, and reference resources. Data is stored in Supabase (`videoplanner` schema) and shared across the team.

## Local development

```bash
npm install
cp .env.example .env.local   # add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Supabase

- Schema: `videoplanner` (tables: plans, screens, hashtags, goals, ctas, captions, screen_sequences)
- Migrations: `supabase/migrations/`
- Seed baseline JSON into an empty database: `npm run seed`
- Screen images: `videoplanner-screens` storage bucket

## Netlify deployment

1. Connect this repo in [Netlify](https://app.netlify.com) (uses `netlify.toml`).
2. Add environment variables under **Site configuration → Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Push to `main` — Netlify rebuilds automatically.

## Project structure

```
src/
  lib/            # Supabase client + storage APIs
  hooks/          # React data hooks
  pages/          # App screens
supabase/
  migrations/     # SQL schema (version controlled)
scripts/
  seed-videoplanner.mjs
  data/               # baseline JSON for npm run seed only
```
