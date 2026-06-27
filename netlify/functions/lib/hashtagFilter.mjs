const CORE_THEMES = ['goals', 'habits', 'smash'];

const THEME_KEYWORDS = [
  { theme: 'study', patterns: [/study|student|exam|jee|school|college|cgpa|learn|rank|sem/i] },
  { theme: 'business', patterns: [/business|entrepreneur|startup|brand|shop|truck|sales|founder/i] },
  { theme: 'fitness', patterns: [/fitness|gym|workout|health|weight|run|yoga/i] },
  { theme: 'creative', patterns: [/art|write|book|crochet|creative|thrift|matcha|juice|craft/i] },
  { theme: 'finance', patterns: [/money|save|finance|budget|invest|laptop|wealth/i] },
  { theme: 'productivity', patterns: [/productiv|focus|planner|organiz|deep/i] },
  { theme: 'journaling', patterns: [/journal|diary|reflect|gratitude/i] },
  { theme: 'motivation', patterns: [/motivat|inspir|mindset|discipline/i] },
];

export function inferThemes(goalName, hook) {
  const text = `${goalName} ${hook}`.toLowerCase();
  const themes = new Set(CORE_THEMES);

  for (const { theme, patterns } of THEME_KEYWORDS) {
    if (patterns.some((p) => p.test(text))) {
      themes.add(theme);
    }
  }

  return [...themes];
}

function themeScore(hashtag, themes) {
  const tagThemes = hashtag.themes ?? [];
  if (tagThemes.length === 0) return 0;
  return tagThemes.filter((t) => themes.includes(t)).length;
}

function categoryRank(category) {
  if (category === 'niche') return 3;
  if (category === 'medium') return 2;
  return 1;
}

export function buildHashtagPool(allHashtags, goalName, hook, limit = 60) {
  const themes = inferThemes(goalName, hook);

  const scored = allHashtags
    .map((tag) => ({
      ...tag,
      score: themeScore(tag, themes) * 10 + categoryRank(tag.category),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.posts ?? 0) - (a.posts ?? 0);
    });

  const themed = scored.filter((t) => t.score >= 20);
  const mediumNiche = scored.filter(
    (t) => t.category === 'medium' || t.category === 'niche'
  );

  const pool = [];
  const seen = new Set();

  const add = (tag) => {
    const key = tag.hashtag.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    pool.push(tag);
  };

  for (const tag of themed) {
    if (pool.length >= limit) break;
    add(tag);
  }

  for (const tag of mediumNiche) {
    if (pool.length >= limit) break;
    add(tag);
  }

  for (const tag of scored) {
    if (pool.length >= limit) break;
    add(tag);
  }

  return pool.slice(0, limit);
}

export function validateHashtags(picked, pool, allowedCategories = ['broad', 'medium', 'niche']) {
  const poolMap = new Map(pool.map((h) => [h.hashtag.toLowerCase(), h]));
  const valid = [];

  for (const raw of picked ?? []) {
    const normalized = raw.startsWith('#') ? raw : `#${raw}`;
    const match = poolMap.get(normalized.toLowerCase());
    if (match && allowedCategories.includes(match.category)) {
      valid.push(match.hashtag);
    }
  }

  return [...new Set(valid)];
}

export function assembleCaption(captionBody, hashtags) {
  const body = captionBody.trim();
  if (!hashtags.length) return body;
  return `${body}\n\n${hashtags.join(' ')}`;
}
