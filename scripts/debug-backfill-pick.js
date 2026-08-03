import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
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

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
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

const { data } = await supabase.from('hashtags').select('*');
const allHashtags = data.map(normalizeHashtag);

const hook = 'This UPSC topper showed me how his daily tracker';
const goal = 'Study 6h everyday';
const picks = pickHashtagsForContent(allHashtags, goal, hook, 3);
console.log('Backfill path picks:', picks.join(' '));
