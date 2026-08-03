import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import {
  expandHashtagKeywords,
  inferContentSignals,
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

const { data } = await supabase.from('hashtags').select('*');
const tags = data.map((row) => ({
  ...row,
  keywords: row.keywords?.length
    ? row.keywords
    : expandHashtagKeywords(row.hashtag, row.themes),
}));

const hooks = [
  { hook: 'This UPSC topper showed me how his daily tracker', goal: '' },
  { hook: 'This IIT Bombay topper showed me his 6h study plan', goal: '' },
  { hook: 'He got into IIT B tracking every study hour', goal: '' },
];

for (const { hook, goal } of hooks) {
  const signals = inferContentSignals(goal, hook);
  const picks = pickHashtagsForContent(tags, goal, hook, 3);
  console.log('\nHook:', hook);
  console.log('Goal:', goal || '(none)');
  console.log(
    'Themes:',
    [...signals.themes.entries()]
      .filter(([, v]) => v >= 0.85)
      .map(([k]) => k)
      .join(', ')
  );
  console.log('Picks:', picks.join(' '));
}

// Also test with actual goals from DB
const { data: people } = await supabase
  .from('this_people')
  .select('id, hook_text, goal_id')
  .in('id', [2, 4, 9, 10, 11, 12]);
const { data: goals } = await supabase.from('goals').select('id, title');
const goalById = new Map(goals.map((g) => [g.id, g.title]));

console.log('\n--- Actual this_people entries ---');
for (const entry of people) {
  const goalName = goalById.get(entry.goal_id) ?? '';
  const picks = pickHashtagsForContent(tags, goalName, entry.hook_text, 3);
  console.log(`#${entry.id} [${goalName}] "${entry.hook_text.slice(0, 50)}"`);
  console.log('  →', picks.join(' '));
}
