# Smash Video Planner

Internal reel planning tool for editors — scripts, sequences, and reference resources. Data is stored in Supabase (`videoplanner` schema) and shared across the team.

## Deployment

Hosted on [Vercel](https://vercel.com). Connect the GitHub repo in Vercel; pushes to `main` deploy automatically.

**Vercel environment variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL` (optional, defaults to `claude-sonnet-4-6`)
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` (person video plan media)
- `HIGGSFIELD_API_KEY_ID`, `HIGGSFIELD_API_KEY_SECRET` (optional, in-app generation)

Local dev: copy env vars into `.env.local`, then run `npm run dev` (`vercel dev` serves the app and `/api` routes).

## Caption generation

- **Model:** Claude Sonnet 4.6 (`claude-sonnet-4-6`) via Vercel serverless function (`/api/generate-caption`)
- **Style:** Intelligent (default) picks from caption styles in Resources, or pick a style manually
- **Hashtags:** 3–4 tags from the hashtags table (medium/niche preferred), appended after the caption

## Supabase

- Schema: `videoplanner` (tables: plans, screens, hashtags, goals, ctas, captions, verbatims, characters, screen_sequences, person_video_plans, person_plan_assets)
- Migrations: `supabase/migrations/`
- Baseline data: `scripts/data/`
- Screen images: `videoplanner-screens` storage bucket

## Project structure

```
src/
  lib/            # Supabase client + storage APIs
  hooks/          # React data hooks
  pages/          # App screens
api/
  handlers/       # Serverless route handlers
  lib/            # Shared handler utilities
supabase/
  migrations/     # SQL schema (version controlled)
scripts/
  data/           # baseline JSON reference data
```
