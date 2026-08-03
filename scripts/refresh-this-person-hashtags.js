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

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  { db: { schema: 'videoplanner' } }
);

function normalizeHashtag(row) {
  const themes = Array.isArray(row.themes) ? row.themes : [];
  const storedKeywords = Array.isArray(row.keywords) ? row.keywords : [];
  return {
    id: row.id,
    hashtag: row.hashtag ?? '',
    posts: row.posts ?? null,
    category: row.category ?? 'broad',
    themes,
    keywords:
      storedKeywords.length > 0
        ? storedKeywords
        : compactHashtagKeywords(row.hashtag ?? '', themes),
  };
}

const [{ data: thisPeople }, { data: goals }] = await Promise.all([
  supabase.from('this_people').select('id, goal_id, hook_text, hashtag').order('id'),
  supabase.from('goals').select('id, title'),
]);

const hashtagRows = await fetchAllHashtagRows(supabase);

const allHashtags = (hashtagRows ?? []).map(normalizeHashtag);
const goalById = new Map((goals ?? []).map((g) => [g.id, g.title ?? '']));

for (const entry of thisPeople ?? []) {
  const goalName = goalById.get(entry.goal_id) ?? '';
  const newHashtag = pickHashtagsForContent(allHashtags, goalName, entry.hook_text ?? '', 3).join(' ');
  const { error } = await supabase
    .from('this_people')
    .update({ hashtag: newHashtag })
    .eq('id', entry.id);
  if (error) {
    console.error(`#${entry.id} failed:`, error.message);
    continue;
  }
  console.log(`#${entry.id}: ${newHashtag}`);
}
