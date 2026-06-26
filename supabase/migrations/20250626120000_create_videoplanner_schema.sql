CREATE SCHEMA IF NOT EXISTS videoplanner;

CREATE TABLE IF NOT EXISTS videoplanner.screens (
  id integer PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  image_url text,
  suggested_copy text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS videoplanner.hashtags (
  id integer PRIMARY KEY,
  hashtag text NOT NULL DEFAULT '',
  posts bigint,
  category text NOT NULL DEFAULT 'broad'
    CHECK (category IN ('broad', 'medium', 'niche')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS videoplanner.goals (
  id integer PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  date_label text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS videoplanner.ctas (
  id integer PRIMARY KEY,
  text text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS videoplanner.captions (
  id integer PRIMARY KEY,
  style text NOT NULL DEFAULT '',
  structure text NOT NULL DEFAULT '',
  guide text NOT NULL DEFAULT '',
  example text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS videoplanner.plans (
  id integer PRIMARY KEY,
  generated_date text NOT NULL DEFAULT '',
  hook text NOT NULL DEFAULT '',
  goal_name text NOT NULL DEFAULT '',
  screens jsonb NOT NULL DEFAULT '[]'::jsonb,
  reference_video_link text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS videoplanner.screen_sequences (
  id text PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  screen_ids integer[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hashtags_category_idx ON videoplanner.hashtags (category);
CREATE INDEX IF NOT EXISTS plans_updated_at_idx ON videoplanner.plans (updated_at DESC);
