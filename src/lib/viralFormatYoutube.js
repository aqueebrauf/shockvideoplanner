export function yt(id, stamp) {
  const [min, sec] = stamp.split(':').map(Number);
  return `https://www.youtube.com/watch?v=${id}&t=${min * 60 + sec}s`;
}
