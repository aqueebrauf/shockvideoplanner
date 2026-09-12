export function fileSafeName(value, fallback = 'untitled') {
  const slug = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

export function triggerBlobDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}

export async function downloadUrlAsFile(url, filename) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Could not download file.');
  }
  triggerBlobDownload(await response.blob(), filename);
}
