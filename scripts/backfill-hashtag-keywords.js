/**
 * 1. Backfill keywords for all hashtags from tag text + themes.
 * 2. Re-pick hashtags for every this_people entry using the new matcher.
 *
 * Run: node scripts/backfill-hashtag-keywords.js
 */
import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { fetchAllHashtagRows } from '../shared/fetchHashtagRows.js';
import {
  compactHashtagKeywords,
  pickHashtagsForContent,
} from '../shared/hashtagMatching.js';

function loadEnvFile() {
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadEnvFile();

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Set VITE_SUPABASE_URL and a Supabase key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'videoplanner' },
});

function normalizeHashtag(row) {
  const themes = Array.isArray(row.themes) ? row.themes : [];
  const storedKeywords = Array.isArray(row.keywords) ? row.keywords : [];
  const keywords =
    storedKeywords.length > 0
      ? storedKeywords
      : compactHashtagKeywords(row.hashtag ?? '', themes);

  return {
    id: row.id,
    hashtag: row.hashtag ?? '',
    posts: row.posts ?? null,
    category: row.category ?? 'broad',
    themes,
    keywords,
  };
}

function pickHashtagsForThisPerson(allHashtags, goalName, hookText) {
  return pickHashtagsForContent(allHashtags, goalName, hookText, 3).join(' ');
}

// --- Backfill hashtag keywords ---
const { data: hashtagRows, error: hashtagError } = await supabase
  .from('hashtags')
  .select('id, hashtag, themes');
if (hashtagError) {
  console.error(hashtagError);
  process.exit(1);
}

let keywordsUpdated = 0;
for (const row of hashtagRows ?? []) {
  const themes = Array.isArray(row.themes) ? row.themes : [];
  const keywords = compactHashtagKeywords(row.hashtag ?? '', themes);
  const { error: updateError } = await supabase
    .from('hashtags')
    .update({ keywords })
    .eq('id', row.id);
  if (updateError) {
    console.error(`Keyword backfill failed id ${row.id}:`, updateError.message);
    continue;
  }
  keywordsUpdated += 1;
}
console.log(`Backfilled keywords for ${keywordsUpdated} hashtags.`);

// --- Reload hashtags with keywords for matching ---
const allHashtagRows = await fetchAllHashtagRows(supabase);
const allHashtags = (allHashtagRows ?? []).map(normalizeHashtag);

// --- Replace hashtags on this_people entries ---
const [{ data: thisPeople, error: peopleError }, { data: goals, error: goalsError }] =
  await Promise.all([
    supabase.from('this_people').select('id, goal_id, hook_text, hashtag').order('id'),
    supabase.from('goals').select('id, title').order('id'),
  ]);

if (peopleError || goalsError) {
  console.error(peopleError ?? goalsError);
  process.exit(1);
}

const goalById = new Map((goals ?? []).map((goal) => [goal.id, goal.title ?? '']));

let peopleUpdated = 0;
for (const entry of thisPeople ?? []) {
  const goalName = goalById.get(entry.goal_id) ?? '';
  const hookText = entry.hook_text ?? '';
  const newHashtag = pickHashtagsForThisPerson(allHashtags, goalName, hookText);

  if (newHashtag === (entry.hashtag ?? '')) {
    console.log(`  #${entry.id} unchanged: ${newHashtag || '(empty)'}`);
    continue;
  }

  const { error: updateError } = await supabase
    .from('this_people')
    .update({ hashtag: newHashtag })
    .eq('id', entry.id);

  if (updateError) {
    console.error(`This person update failed id ${entry.id}:`, updateError.message);
    continue;
  }

  peopleUpdated += 1;
  console.log(`  #${entry.id} "${hookText.slice(0, 40)}..."`);
  console.log(`    ${entry.hashtag || '(empty)'} → ${newHashtag}`);
}

console.log(`Updated hashtags on ${peopleUpdated} this person entries.`);
