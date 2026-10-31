import { viralFormatEntriesA } from './viralFormatEntriesA';
import { viralFormatEntriesB } from './viralFormatEntriesB';

function prose(side) {
  return [side?.hookDescription, side?.videoCopy, side?.videoDescription, side?.notes]
    .map((part) => (part ?? '').trim())
    .filter(Boolean);
}

function linkLines(links) {
  return (links ?? [])
    .map((link) => {
      const label = (link?.label ?? '').trim();
      const url = (link?.url ?? '').trim();
      if (label && url) return `${label}\n${url}`;
      return label || url;
    })
    .filter(Boolean)
    .join('\n\n');
}

function originalSide(entry) {
  const parts = prose(entry.original);
  const links = linkLines(entry.links);
  if (links) parts.push(links);
  return {
    hookCopy: entry.original?.hookCopy ?? '',
    notes: parts.join('\n\n'),
  };
}

function smashSide(entry) {
  return {
    hookCopy: entry.smash?.hookCopy ?? '',
    notes: prose(entry.smash).join('\n\n'),
  };
}

export const VIRAL_FORMAT_SEED = [...viralFormatEntriesA, ...viralFormatEntriesB].map(
  (entry, index) => ({
    id: index + 1,
    sortOrder: index + 1,
    appName: entry.appName ?? '',
    formatName: entry.formatName ?? '',
    priority: Boolean(entry.priority),
    sampleVideos: [],
    original: originalSide(entry),
    smash: smashSide(entry),
  })
);
