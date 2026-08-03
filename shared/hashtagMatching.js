/** Brand themes — weak baseline relevance for Smash goal/habit content. */
export const BRAND_THEMES = ['goals', 'habits', 'smash'];

/** Exam-specific themes — high priority when content mentions them. */
export const EXAM_THEMES = ['upsc', 'iitjee', 'neet', 'gate', 'cat'];

/** Theme definitions with keyword lists used for content inference and hashtag expansion. */
export const THEME_DEFINITIONS = {
  study: {
    keywords: [
      'study', 'student', 'exam', 'school', 'college', 'cgpa', 'learn', 'rank', 'sem',
      'education', 'academ', 'homework', 'university', 'grad', 'board',
      'engineering', 'lecture', 'notes', 'revision', 'gpa', 'classroom', 'teacher', 'professor',
      'topper', 'prep', 'preparation',
    ],
  },
  upsc: {
    keywords: [
      'upsc', 'ias', 'civil', 'prelims', 'mains', 'aspirant', 'aspirants', 'cse', 'ifs',
      'upscexam', 'upscprep', 'upscpreparation', 'upscmotivation', 'rank', 'holder', 'dropper',
    ],
  },
  iitjee: {
    keywords: [
      'iit', 'jee', 'iitjee', 'jeemains', 'jeemain', 'jeeadvanced', 'bombay', 'delhi',
      'kanpur', 'roorkee', 'kharagpur', 'madras', 'guwahati', 'hyderabad', 'indore',
      'engineering', 'iitb', 'iitd', 'iitians',
    ],
  },
  neet: {
    keywords: [
      'neet', 'mbbs', 'medical', 'doctor', 'neetprep', 'neetaspirant', 'neetug',
    ],
  },
  gate: {
    keywords: ['gate', 'gateexam', 'gateprep', 'gateaspirant'],
  },
  cat: {
    keywords: ['cat', 'catexam', 'catprep', 'mba', 'iim'],
  },
  business: {
    keywords: [
      'business', 'entrepreneur', 'startup', 'brand', 'shop', 'truck', 'sales', 'founder',
      'hustle', 'smallbiz', 'ceo', 'marketing', 'sidehustle', 'client', 'revenue', 'launch',
      'ecommerce', 'freelance', 'agency', 'company', 'solopreneur',
    ],
  },
  fitness: {
    keywords: [
      'fitness', 'gym', 'workout', 'health', 'weight', 'run', 'yoga', 'sport', 'muscle',
      'diet', 'wellness', 'cardio', 'lift', 'training', 'exercise', 'calorie', 'protein',
    ],
  },
  creative: {
    keywords: [
      'art', 'design', 'write', 'book', 'music', 'craft', 'crochet', 'creative', 'photography',
      'content', 'creator', 'thrift', 'matcha', 'juice', 'draw', 'paint', 'film', 'video',
      'aesthetic', 'diy', 'maker',
    ],
  },
  finance: {
    keywords: [
      'money', 'save', 'finance', 'budget', 'invest', 'laptop', 'wealth', 'debt', 'frugal',
      'income', 'cash', 'saving', 'expense', 'salary', 'passive', 'fire', 'frugal',
    ],
  },
  productivity: {
    keywords: [
      'productiv', 'focus', 'planner', 'organiz', 'deep', 'timemanag', 'deepwork', 'efficiency',
      'workflow', 'tool', 'pomodoro', 'calendar', 'schedule', 'task', 'priorit',
    ],
  },
  journaling: {
    keywords: [
      'journal', 'diary', 'reflect', 'gratitude', 'mindful', 'selfcare', 'mental', 'wellbeing',
      'therapy', 'emotion', 'introspect',
    ],
  },
  motivation: {
    keywords: [
      'motivat', 'inspir', 'mindset', 'discipline', 'success', 'grind', 'nevergiveup', 'believe',
      'dream', 'ambition', 'consistency', 'growth', 'resilience', 'push',
    ],
  },
  goals: {
    keywords: [
      'goal', 'milestone', 'achiev', 'target', 'plan', 'progress', 'commit', 'crush', 'smash',
      'goaltrack', 'goalset', 'goalplan', 'goalget',
    ],
  },
  habits: {
    keywords: [
      'habit', 'routine', 'daily', 'streak', 'discipline', 'consistency', 'atomic', 'tracker',
      'checkin', 'showup', 'habittrack', 'morning', 'ritual',
    ],
  },
  smash: {
    keywords: [
      'smash', 'goaltrack', 'habittrack', 'goalset', 'goalplan', 'goalget', 'goalsmasher', 'showup',
    ],
  },
};

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
  'ought', 'used', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that', 'these', 'those', 'what', 'which',
  'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
  'too', 'very', 'just', 'don', 'now', 're', 've', 'll', 'd', 's', 't', 'm', 'up', 'out',
]);

/** Split camelCase / digits / punctuation in hashtag text into searchable tokens. */
export function splitHashtagText(hashtag) {
  const bare = String(hashtag ?? '').replace(/^#+/, '').trim();
  if (!bare) return [];

  const parts = bare
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d)/g, '$1 $2')
    .replace(/(\d)([A-Za-z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length >= 2);

  return [...new Set(parts)];
}

export function tokenizeContent(text) {
  const normalized = String(text ?? '').toLowerCase();
  const tokens = normalized
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length >= 2 && !STOPWORDS.has(part));
  return new Set(tokens);
}

function themeKeywords(theme) {
  return THEME_DEFINITIONS[theme]?.keywords ?? [];
}

/** Tag-specific keywords for storage (hashtag text + theme names + manual extras). */
export function compactHashtagKeywords(hashtag, themes = [], storedKeywords = []) {
  const result = new Set();

  for (const kw of storedKeywords ?? []) {
    const trimmed = String(kw).trim().toLowerCase();
    if (trimmed.length >= 2) result.add(trimmed);
  }

  for (const token of splitHashtagText(hashtag)) {
    result.add(token);
  }

  for (const theme of themes ?? []) {
    if (theme !== 'general') result.add(theme.toLowerCase());
  }

  return [...result];
}

/** Build searchable keywords for matching — includes theme keyword lists at runtime only. */
export function expandHashtagKeywords(hashtag, themes = [], storedKeywords = []) {
  const result = new Set(compactHashtagKeywords(hashtag, themes, storedKeywords));

  for (const theme of themes ?? []) {
    if (theme === 'general') continue;
    for (const kw of themeKeywords(theme)) {
      result.add(kw.toLowerCase());
    }
  }

  return [...result];
}

/**
 * Infer themes and tokens from goal + hook text.
 * Brand themes get a low baseline; matched content themes get full weight.
 */
export function inferContentSignals(goalName, hook) {
  const text = `${goalName ?? ''} ${hook ?? ''}`.toLowerCase();
  const tokens = tokenizeContent(text);
  const themes = new Map();

  for (const theme of BRAND_THEMES) {
    themes.set(theme, 0.25);
  }

  for (const [theme, def] of Object.entries(THEME_DEFINITIONS)) {
    let confidence = 0;
    for (const kw of def.keywords) {
      const lower = kw.toLowerCase();
      if (text.includes(lower)) {
        confidence = Math.max(confidence, 1);
        continue;
      }
      for (const token of tokens) {
        if (token.includes(lower) || lower.includes(token)) {
          confidence = Math.max(confidence, 0.85);
        }
      }
    }
    if (confidence > 0) {
      themes.set(theme, Math.max(themes.get(theme) ?? 0, confidence));
    }
  }

  return { text, tokens, themes };
}

function categoryRank(category) {
  if (category === 'niche') return 3;
  if (category === 'medium') return 2;
  return 1;
}

function hasSpecificContentThemes(signals) {
  return [...signals.themes.entries()].some(
    ([theme, confidence]) =>
      confidence >= 0.85 && theme !== 'general' && !BRAND_THEMES.includes(theme)
  );
}

/** Score how well a hashtag matches the content signals (higher = better fit). */
export function scoreHashtagForContent(hashtag, signals) {
  const tagThemes = hashtag.themes ?? [];
  const tagKeywords = expandHashtagKeywords(
    hashtag.hashtag,
    tagThemes,
    hashtag.keywords
  );

  let score = 0;

  for (const theme of tagThemes) {
    if (theme === 'general') continue;
    const confidence = signals.themes.get(theme) ?? 0;
    if (confidence <= 0) continue;
    let weight = 18;
    if (BRAND_THEMES.includes(theme)) weight = 6;
    else if (EXAM_THEMES.includes(theme)) weight = 28;
    score += confidence * weight;
  }

  let keywordHits = 0;
  for (const kw of tagKeywords) {
    if (kw.length < 3) {
      if (signals.tokens.has(kw) || signals.text.includes(kw)) keywordHits++;
      continue;
    }
    if (signals.text.includes(kw)) {
      keywordHits++;
      continue;
    }
    for (const token of signals.tokens) {
      if (token.includes(kw) || kw.includes(token)) {
        keywordHits++;
        break;
      }
    }
  }
  score += keywordHits * 8;

  const bareTag = String(hashtag.hashtag ?? '').replace(/^#+/, '').toLowerCase();
  if (bareTag.length >= 3 && signals.text.includes(bareTag)) {
    score += bareTag.length <= 5 ? 40 : 25;
  }

  for (const token of splitHashtagText(hashtag.hashtag)) {
    if (token.length >= 3 && signals.text.includes(token)) {
      score += 15;
    }
  }

  score += categoryRank(hashtag.category) * 2;

  if (
    hasSpecificContentThemes(signals) &&
    tagThemes.length === 1 &&
    tagThemes[0] === 'general'
  ) {
    score -= 12;
  }

  return score;
}

function detectedExamThemes(signals) {
  return EXAM_THEMES.filter((theme) => (signals.themes.get(theme) ?? 0) >= 0.85);
}

/** Pick the best N hashtags for a piece of content (this-person, fallback, etc.). */
export function pickHashtagsForContent(allHashtags, goalName, hook, count = 3) {
  const signals = inferContentSignals(goalName, hook);
  const scored = allHashtags
    .map((tag) => ({
      ...tag,
      score: scoreHashtagForContent(tag, signals),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.posts ?? 0) - (a.posts ?? 0);
    });

  const picks = [];
  const seen = new Set();
  const examThemes = detectedExamThemes(signals);

  const add = (tag) => {
    const key = tag.hashtag.toLowerCase();
    if (seen.has(key) || picks.length >= count) return false;
    seen.add(key);
    picks.push(tag);
    return true;
  };

  for (const examTheme of examThemes) {
    const examTags = scored.filter((tag) => tag.themes?.includes(examTheme));
    const acronymMatches = examTags
      .filter((tag) => {
        const bare = tag.hashtag.replace(/^#+/, '').toLowerCase();
        return bare.length <= 6 && signals.text.includes(bare);
      })
      .sort((a, b) => a.hashtag.length - b.hashtag.length);

    if (acronymMatches[0]) add(acronymMatches[0]);
    else {
      const mediumNiche = examTags.filter(
        (tag) => tag.category === 'medium' || tag.category === 'niche'
      );
      if (mediumNiche[0]) add(mediumNiche[0]);
    }
  }

  for (const tag of scored) {
    if (picks.length >= count) break;
    const bare = tag.hashtag.replace(/^#+/, '').toLowerCase();
    if (bare.length >= 3 && bare.length <= 8 && signals.text.includes(bare)) {
      add(tag);
    }
  }

  for (const tag of scored) {
    if (picks.length >= count) break;
    if (tag.category === 'medium' || tag.category === 'niche') add(tag);
  }

  for (const tag of scored) {
    if (picks.length >= count) break;
    add(tag);
  }

  return picks.slice(0, count).map((tag) => tag.hashtag);
}

export function buildHashtagPool(allHashtags, goalName, hook, limit = 60) {
  const signals = inferContentSignals(goalName, hook);

  const scored = allHashtags
    .map((tag) => ({
      ...tag,
      score: scoreHashtagForContent(tag, signals),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.posts ?? 0) - (a.posts ?? 0);
    });

  const topScore = scored[0]?.score ?? 0;
  const themedThreshold = Math.max(20, topScore * 0.45);
  const themed = scored.filter((t) => t.score >= themedThreshold);
  const mediumNiche = scored.filter(
    (t) => (t.category === 'medium' || t.category === 'niche') && t.score > 0
  );

  const pool = [];
  const seen = new Set();

  const add = (tag) => {
    const key = tag.hashtag.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    pool.push(tag);
  };

  // Pin top algorithm picks first so LLM and fallbacks always see exam-specific tags.
  for (const hashtag of pickHashtagsForContent(allHashtags, goalName, hook, 5)) {
    const tag = scored.find((t) => t.hashtag.toLowerCase() === hashtag.toLowerCase());
    if (tag) add(tag);
  }

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

/** @deprecated Use inferContentSignals — kept for any external callers. */
export function inferThemes(goalName, hook) {
  const { themes } = inferContentSignals(goalName, hook);
  return [...themes.keys()].filter((t) => (themes.get(t) ?? 0) > 0);
}
