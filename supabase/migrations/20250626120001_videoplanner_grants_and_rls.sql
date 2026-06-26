GRANT USAGE ON SCHEMA videoplanner TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA videoplanner TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA videoplanner TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA videoplanner GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA videoplanner GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

ALTER TABLE videoplanner.screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE videoplanner.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE videoplanner.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE videoplanner.ctas ENABLE ROW LEVEL SECURITY;
ALTER TABLE videoplanner.captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE videoplanner.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE videoplanner.screen_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_screens" ON videoplanner.screens FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_hashtags" ON videoplanner.hashtags FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_goals" ON videoplanner.goals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_ctas" ON videoplanner.ctas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_captions" ON videoplanner.captions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_plans" ON videoplanner.plans FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_screen_sequences" ON videoplanner.screen_sequences FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
