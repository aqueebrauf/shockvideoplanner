import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadJson(relativePath) {
  return JSON.parse(readFileSync(join(root, relativePath), 'utf8'));
}

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before seeding.');
  process.exit(1);
}

const supabase = createClient(url, key, { db: { schema: 'videoplanner' } });

async function count(table) {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

async function seedTable(table, rows, batchSize = 500) {
  const existing = await count(table);
  if (existing > 0) {
    console.log(`Skip ${table}: already has ${existing} rows`);
    return;
  }

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).insert(batch);
    if (error) throw error;
    console.log(`  ${table}: inserted ${Math.min(i + batch.length, rows.length)}/${rows.length}`);
  }
}

const screens = loadJson('scripts/data/screens.json').map((row) => ({
  id: row.id,
  name: row.name ?? '',
  image_url: row.image ?? null,
  suggested_copy: row.suggestedCopy ?? '',
}));

const hashtags = loadJson('scripts/data/hashtags.json').map((row) => ({
  id: row.id,
  hashtag: row.hashtag ?? '',
  posts:
    row.posts == null || Number.isNaN(Number(row.posts))
      ? null
      : Math.round(Number(row.posts)),
  category: row.category ?? 'broad',
}));

const goals = loadJson('scripts/data/goals.json').map((row) => ({
  id: row.id,
  title: row.title ?? '',
  link: row.link ?? '',
  date_label: row.date ?? '',
}));

const ctas = loadJson('scripts/data/ctas.json').map((row) => ({
  id: row.id,
  text: row.text ?? '',
}));

const captions = loadJson('scripts/data/captions.json').map((row) => ({
  id: row.id,
  style: row.style ?? '',
  structure: row.structure ?? '',
  guide: row.guide ?? '',
  example: row.example ?? '',
}));

const plans = loadJson('scripts/data/plan.json').map((row) => ({
  id: row.id,
  generated_date: row.generatedDate ?? '',
  hook: row.hook ?? '',
  goal_name: row.goalName ?? '',
  screens: row.screens ?? [],
  reference_video_link: row.referenceVideoLink ?? '',
  caption: row.caption ?? '',
}));

const screenSequences = [
  {
    id: 'primary-demo',
    name: 'Primary Demo',
    screen_ids: [2, 4, 9, 11, 12],
  },
];

console.log('Seeding videoplanner schema…');

await seedTable('screens', screens);
await seedTable('hashtags', hashtags);
await seedTable('goals', goals);
await seedTable('ctas', ctas);
await seedTable('captions', captions);
await seedTable('plans', plans);
await seedTable('screen_sequences', screenSequences);

console.log('Done.');
