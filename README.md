# Smash Video Planner

Internal reel planning tool for editors — scripts, sequences, and reference resources. Data is stored in Supabase (`videoplanner` schema) and shared across the team.

## Deployment

Hosted on [Vercel](https://vercel.com). Connect the GitHub repo in Vercel; pushes to `main` deploy automatically.

**Vercel environment variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL` (optional, defaults to `claude-sonnet-4-6`)
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` (Showed Me plan media)
- `HIGGSFIELD_API_KEY_ID`, `HIGGSFIELD_API_KEY_SECRET` (optional, in-app generation)

Local dev: copy env vars into `.env.local`, then run `npm run dev` (`vercel dev` serves the app and `/api` routes).

**R2 CORS (required for browser uploads):** Cloudflare dashboard → R2 → `smash-video-planner` → Settings → CORS → paste `scripts/r2-cors.json`. Add your Vercel preview URL to `AllowedOrigins` if you use preview deploy links.

## Supabase

- Schema: `videoplanner` (tables: hashtags, goals, captions, verbatims, characters, screen_sequences, this_people, showed_me_hooks, showed_me_plans, showed_me_plan_assets, goal_demo_backgrounds)
- Migrations: `supabase/migrations/`
- Baseline data: `scripts/data/`

## Project structure

```
src/
  lib/            # Supabase client + storage APIs
  hooks/          # React data hooks
  pages/          # App screens
api/
  [route].js      # Single Vercel serverless entry (Hobby plan limit)
server/
  handlers/       # Route handlers
  lib/            # Shared handler utilities
supabase/
  migrations/     # SQL schema (version controlled)
scripts/
  data/           # baseline JSON reference data
```
