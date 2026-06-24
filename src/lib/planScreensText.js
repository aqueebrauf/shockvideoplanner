import { normalizeScreen } from './planStorage';

export function screensToText(screens) {
  return screens
    .map(({ name, copy }) => {
      const screenName = name.trim();
      const screenCopy = copy.trim();
      if (!screenName && !screenCopy) return '';
      if (!screenCopy) return screenName;
      if (!screenName) return screenCopy;
      return `${screenName}\n${screenCopy}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

export function textToScreens(text) {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split('\n');
      return normalizeScreen({
        name: lines[0] ?? '',
        copy: lines.slice(1).join('\n'),
      });
    });
}
