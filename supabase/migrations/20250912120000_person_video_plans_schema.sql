-- Person video plans: full production pipeline per reel
CREATE TABLE IF NOT EXISTS videoplanner.person_video_plans (
  id integer PRIMARY KEY,
  goal_id integer REFERENCES videoplanner.goals(id) ON DELETE SET NULL,
  hook_text text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  hashtag text NOT NULL DEFAULT '',
  workflow_status text NOT NULL DEFAULT 'draft'
    CHECK (workflow_status IN ('draft', 'ready')),
  status text NOT NULL DEFAULT 'not started'
    CHECK (status IN ('not started', 'completed')),
  selected_demo_asset_id integer,
  selected_hook_image_id integer,
  selected_hook_video_id integer,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS videoplanner.person_plan_assets (
  id integer PRIMARY KEY,
  plan_id integer NOT NULL REFERENCES videoplanner.person_video_plans(id) ON DELETE CASCADE,
  asset_type text NOT NULL CHECK (asset_type IN (
    'demo_clip',
    'demo_first_frame',
    'reference_image',
    'hook_image',
    'hook_video'
  )),
  storage_key text NOT NULL DEFAULT '',
  public_url text NOT NULL DEFAULT '',
  mime_type text NOT NULL DEFAULT '',
  iteration integer NOT NULL DEFAULT 1,
  is_selected boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'deleted', 'generating')),
  generation_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  parent_asset_id integer,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS person_plan_assets_plan_id_idx
  ON videoplanner.person_plan_assets (plan_id);

CREATE INDEX IF NOT EXISTS person_video_plans_goal_id_idx
  ON videoplanner.person_video_plans (goal_id);

GRANT ALL ON videoplanner.person_video_plans TO anon, authenticated, service_role;
GRANT ALL ON videoplanner.person_plan_assets TO anon, authenticated, service_role;

ALTER TABLE videoplanner.person_video_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE videoplanner.person_plan_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_person_video_plans" ON videoplanner.person_video_plans
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "anon_all_person_plan_assets" ON videoplanner.person_plan_assets
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
