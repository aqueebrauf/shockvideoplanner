import { fetchAllHashtagRows } from '../../../shared/fetchHashtagRows.js';
import {
  BRAND_THEMES,
  THEME_DEFINITIONS,
  buildHashtagPool,
  compactHashtagKeywords,
  expandHashtagKeywords,
  inferContentSignals,
  inferThemes,
  pickHashtagsForContent,
  scoreHashtagForContent,
  splitHashtagText,
  tokenizeContent,
} from '../../../shared/hashtagMatching.js';

export {
  BRAND_THEMES,
  THEME_DEFINITIONS,
  buildHashtagPool,
  compactHashtagKeywords,
  expandHashtagKeywords,
  inferContentSignals,
  inferThemes,
  pickHashtagsForContent,
  scoreHashtagForContent,
  splitHashtagText,
  tokenizeContent,
  fetchAllHashtagRows,
};

export function normalizeHashtagRow(row) {
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

function isListItem(line) {
  return /^\d+[.)]\s/.test(line.trim());
}

function isListHeader(line, nextLine) {
  return line.trim().endsWith(':') && nextLine && isListItem(nextLine);
}

export function normalizeCaptionParagraphs(text) {
  const normalized = String(text ?? '').replace(/\r\n/g, '\n').trim();
  if (!normalized) return '';

  if (/\n\n/.test(normalized)) {
    return normalized
      .replace(/\n{3,}/g, '\n\n')
      .split('\n\n')
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .join('\n\n');
  }

  const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);
  const paragraphs = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const nextLine = lines[index + 1];

    if (isListHeader(line, nextLine)) {
      const block = [line];
      index += 1;
      while (index < lines.length && isListItem(lines[index])) {
        block.push(lines[index]);
        index += 1;
      }
      paragraphs.push(block.join('\n'));
      continue;
    }

    if (isListItem(line)) {
      const block = [line];
      index += 1;
      while (index < lines.length && isListItem(lines[index])) {
        block.push(lines[index]);
        index += 1;
      }
      paragraphs.push(block.join('\n'));
      continue;
    }

    paragraphs.push(line);
    index += 1;
  }

  return paragraphs.join('\n\n');
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
  const body = normalizeCaptionParagraphs(captionBody);
  if (!hashtags.length) return body;
  return `${body}\n\n${hashtags.join(' ')}`;
}
