-- Caption generation: schema upgrades for styles, hashtags, and plan traceability

ALTER TABLE videoplanner.captions
  ADD COLUMN IF NOT EXISTS hook_signals text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS max_chars integer;

ALTER TABLE videoplanner.hashtags
  ADD COLUMN IF NOT EXISTS themes text[] NOT NULL DEFAULT '{}';

ALTER TABLE videoplanner.plans
  ADD COLUMN IF NOT EXISTS caption_style text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hashtags_used jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS hashtags_themes_gin_idx
  ON videoplanner.hashtags USING GIN (themes);

CREATE INDEX IF NOT EXISTS hashtags_category_posts_idx
  ON videoplanner.hashtags (category, posts DESC NULLS LAST);

-- Remove stat-based caption style and legacy row after renumber
DELETE FROM videoplanner.captions WHERE style = 'Social Proof';
DELETE FROM videoplanner.captions WHERE id = 10;

-- Upsert caption style definitions (safe to re-run)
INSERT INTO videoplanner.captions (id, style, hook_signals, structure, guide, example, max_chars)
VALUES
  (1, 'Direct Response',
   'POV hooks, relatable failure moments, that face when, emotional reaction to missing goals or breaking streaks',
   E'Line 1: Hook echo\nLine 2: Bridge to Smash\nLine 3: Concrete benefit\nLine 4: CTA',
   'Line 1 mirrors the video hook in under 60 characters. Line 2 names Smash and states the core benefit in 3 to 5 words. Line 3 gives one concrete outcome the app enables (daily show up, streak repair, weekly check in) without invented stats. Line 4 matches the selected CTA. Total 125 to 220 characters. Max 2 emojis.',
   E'POV: You just missed your goal 30 days in a row 😱\nSmash makes showing up stupid simple.\nDaily check ins + streak repair so you never miss twice.\nComment GOALS for free link ↓',
   220),
  (2, 'CTA First',
   'Warm audience, direct ask, comment bait hooks, save this energy, viewers who already get goal tracking',
   E'Line 1: Strong CTA\nLine 2: Why act now\nLine 3: What they get',
   'Put the call to action in line 1 using the selected CTA wording. Line 2 explains the payoff in one sentence tied to the goal. Line 3 stacks one more benefit from the demo (milestones, journaling, weekly check ins). Under 200 characters. Best when the hook already sold the problem.',
   E'Comment GOALS for the link ↓\nYou asked for a goal app that stops you from quitting.\nSmash tracks streaks and calls you out when you skip.',
   200),
  (3, 'Value Bomb',
   'Numbered hooks (3 reasons, 5 rules), listicle energy, educational tone, tips about goal failure or habit building',
   E'Line 1: Numbered hook\nBody: 3 bullets\nLast line: Tie to Smash',
   'Start with a number (3 reasons, 5 rules). Each bullet is one line, one insight about hitting goals. No fluff. Last line connects the value to Smash features shown in the video. 200 to 400 characters. Optimized for saves.',
   E'3 reasons you keep failing your goals:\n1. You track results not actions\n2. You have zero accountability when motivation dips\n3. You quit after missing 2 days\nSmash fixes all 3 with daily check ins and streak repair.',
   400),
  (4, 'Curiosity Gap',
   'Bold claim without revealing answer, watch till end, see what happens, mysterious transformation, one rule changed everything',
   E'Line 1: Open loop\nLine 2: Hint not answer\nLine 3: CTA',
   'Create tension with a bold claim about goal achievement. Do not reveal the answer in the caption — force them to watch. Reference a timestamp or watch till end when the hook supports it. End with CTA matching the selected CTA. Under 150 characters.',
   E'This one rule made me stop quitting every goal 😱\nSee what happens at 0:06.\nComment GOALS if you want it.',
   150),
  (5, 'Meme or One Liner',
   'Short meme format, me vs me, January person joke, under 10 word hooks, video carries most of the message',
   E'Line 1: Relatable joke or POV\nOptional Line 2: Smash punchline',
   'Use a common meme format or POV. Keep line 1 under 50 characters. Must be instantly relatable to people who set goals. Optional second line ties to Smash in 5 to 8 words. Use when the demo video carries 90 percent of the value.',
   E'Me vs the person I said I would be in January:\nSmash keeps me honest.',
   100),
  (6, 'Objection Killer',
   'Skepticism, another app?, too complicated, won''t stick, free?, takes too long — doubt or pushback in the hook',
   E'Line 1: Yes, it''s...\nLine 2: Kill top objection\nLine 3: Proof from demo\nLine 4: CTA',
   'Line 1 starts with Yes, it''s actually free or Yes, it takes 10 seconds. Line 2 addresses the main doubt about goal apps. Line 3 points to what the video shows (5 second check in, simple UI). Line 4 is CTA. No invented stats.',
   E'Yes, Smash is actually free 😅\nNo fluff. No 50 features. Just daily check ins.\nWatch it take 5 seconds to log your day.\nComment GOALS to try ↓',
   250),
  (7, 'Before After',
   'Transformation arc, used to vs now, quit by week 2 vs streak, before and after contrast in hook or goal',
   E'Line 1: Before\nLine 2: After\nLine 3: How (Smash)\nLine 4: CTA',
   'Line 1 paints the painful before state tied to the goal. Line 2 shows the ideal after state. Line 3 says how Smash bridges them using features from the screen sequence. Line 4 is CTA. Keep each line short.',
   E'Before: Quit every goal by week 2\nAfter: Showing up daily on autopilot\nHow: Smash makes check ins non negotiable\nComment GOALS for free link ↓',
   250),
  (8, 'FOMO or Urgency',
   'Limited time, before paywall, start today, don''t wait, last chance, while it''s free',
   E'Line 1: Scarcity hook\nLine 2: Cost of waiting\nLine 3: CTA with urgency',
   'Line 1 uses time or access scarcity without fake countdowns or invented user counts. Line 2 states what happens if they delay starting their goal. Line 3 adds urgency to the CTA. Use sparingly — only when the hook already has urgency. No fabricated statistics.',
   E'Still planning to start that goal next Monday?\nEvery day you wait is another day you don''t show up.\nComment GOALS and start today ↓',
   200),
  (9, 'Book Passage',
   'Book quote, atomic habits, deep work, reading, planning session, journal, philosophy of consistency',
   E'Line 1: Passage excerpt\nLine 2: Book + author\nLine 3: Concept in plain words\nLine 4: Tie to Smash\nLine 5: CTA',
   'Use a passage 40 to 80 words from a real productivity, habits, or goals book (name the book and author). Line 3 breaks down the idea simply. Line 4 connects to how Smash helps (streaks, never miss twice, milestones). Line 5 is CTA. 300 to 450 characters. Use when the video shows reading, planning, or journaling.',
   E'You do not rise to the level of your goals. You fall to the level of your systems.\nFrom Atomic Habits by James Clear\nConsistency beats intensity — your system matters more than motivation.\nSmash is the system that protects your streak so you never miss twice.\nComment GOALS to start yours ↓',
   450)
ON CONFLICT (id) DO UPDATE SET
  style = EXCLUDED.style,
  hook_signals = EXCLUDED.hook_signals,
  structure = EXCLUDED.structure,
  guide = EXCLUDED.guide,
  example = EXCLUDED.example,
  max_chars = EXCLUDED.max_chars,
  updated_at = now();

-- Assign hashtag themes from tag text (no local sync script needed)
WITH tagged AS (
  SELECT
    id,
    array_remove(ARRAY[
      CASE WHEN tag ~* 'study|student|exam|jee|school|college|cgpa|learn|education|academ|homework|university|grad|medical|neet|board' THEN 'study' END,
      CASE WHEN tag ~* 'business|entrepreneur|startup|brand|shop|truck|sales|founder|hustle|smallbiz|ceo|marketing|sidehustle' THEN 'business' END,
      CASE WHEN tag ~* 'fitness|gym|workout|health|weight|run|yoga|sport|muscle|diet|wellness' THEN 'fitness' END,
      CASE WHEN tag ~* 'art|design|write|book|music|craft|crochet|creative|photography|content|creator|thrift|matcha|juice' THEN 'creative' END,
      CASE WHEN tag ~* 'money|save|finance|budget|invest|wealth|debt|frugal|income|cash' THEN 'finance' END,
      CASE WHEN tag ~* 'habit|routine|daily|streak|discipline|consistency|atomic|tracker|checkin|showup' THEN 'habits' END,
      CASE WHEN tag ~* 'productiv|focus|planner|organiz|timemanag|deepwork|efficiency|workflow|tool' THEN 'productivity' END,
      CASE WHEN tag ~* 'journal|diary|reflect|gratitude|mindful|selfcare|mental|wellbeing' THEN 'journaling' END,
      CASE WHEN tag ~* 'motivat|inspir|mindset|success|grind|nevergiveup|believe|dream|ambition' THEN 'motivation' END,
      CASE WHEN tag ~* 'goal|milestone|achiev|target|smash|crush|plan|progress|commit' THEN 'goals' END,
      CASE WHEN tag ~* 'goaltrack|habittrack|goalset|goalplan|goalget|goalsmasher|showup' THEN 'smash' END
    ], NULL) AS matched
  FROM videoplanner.hashtags,
  LATERAL (SELECT ltrim(hashtag, '#') AS tag) t
)
UPDATE videoplanner.hashtags h
SET themes = CASE
  WHEN cardinality(t.matched) > 0 THEN t.matched
  ELSE ARRAY['general']::text[]
END
FROM tagged t
WHERE h.id = t.id;
