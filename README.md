# Shock Video Planner

Internal reel planning tool for editors — scripts, sequences, and reference resources. Data is stored in Supabase (`videoplanner` schema) and shared across the team.

## Deployment

Hosted on Netlify. Push to `main` to deploy automatically.

**Netlify environment variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

## Caption generation

- **Model:** Claude Sonnet via Netlify Function (`/api/generate-caption`)
- **Style:** Intelligent (default) picks from caption styles in Resources, or pick a style manually
- **Hashtags:** 3–4 tags from the hashtags table (medium/niche preferred), appended after the caption

## Supabase

- Schema: `videoplanner` (tables: plans, screens, hashtags, goals, ctas, captions, screen_sequences)
- Migrations: `supabase/migrations/`
- Baseline data: `scripts/data/`
- Screen images: `videoplanner-screens` storage bucket

## Project structure

```
src/
  lib/            # Supabase client + storage APIs
  hooks/          # React data hooks
  pages/          # App screens
netlify/
  functions/      # generate-caption (Claude Sonnet)
supabase/
  migrations/     # SQL schema (version controlled)
scripts/
  data/           # baseline JSON reference data
```
