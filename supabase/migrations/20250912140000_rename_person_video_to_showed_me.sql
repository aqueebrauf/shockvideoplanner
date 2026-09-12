-- Rename Person Video tables to Showed Me. Existing rows stay in place.
ALTER TABLE IF EXISTS videoplanner.person_video_plans RENAME TO showed_me_plans;
ALTER TABLE IF EXISTS videoplanner.person_plan_assets RENAME TO showed_me_plan_assets;

ALTER INDEX IF EXISTS videoplanner.person_video_plans_goal_id_idx
  RENAME TO showed_me_plans_goal_id_idx;
ALTER INDEX IF EXISTS videoplanner.person_plan_assets_plan_id_idx
  RENAME TO showed_me_plan_assets_plan_id_idx;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'videoplanner'
      AND tablename = 'showed_me_plans'
      AND policyname = 'anon_all_person_video_plans'
  ) THEN
    ALTER POLICY "anon_all_person_video_plans" ON videoplanner.showed_me_plans
      RENAME TO "anon_all_showed_me_plans";
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'videoplanner'
      AND tablename = 'showed_me_plan_assets'
      AND policyname = 'anon_all_person_plan_assets'
  ) THEN
    ALTER POLICY "anon_all_person_plan_assets" ON videoplanner.showed_me_plan_assets
      RENAME TO "anon_all_showed_me_plan_assets";
  END IF;
END $$;
