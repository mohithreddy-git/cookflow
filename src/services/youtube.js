/**
 * Get embeddable YouTube video info via oEmbed — no API key needed.
 */
export async function getYouTubeEmbed(videoId) {
  if (!videoId) return null;
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title,
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
      thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  } catch {
    return null;
  }
}

/**
 * Extract video ID from any YouTube URL format
 */
export function parseYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Search YouTube for cooking videos via a CORS-friendly public API.
 * Uses a public RSS-based search proxy — completely free, no key.
 */
export async function searchCookingVideos(query) {
  // Use YouTube's search RSS feed via a public RSS-to-JSON converter
  const encoded = encodeURIComponent(`${query} recipe cooking`);
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?q=${encoded}`;
  try {
    // Try the direct RSS feed first and parse
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== 'ok' || !data.items) return [];
    return data.items.slice(0, 5).map((item) => ({
      title: item.title,
      videoId: parseYouTubeId(item.link),
      thumbnailUrl: item.thumbnail,
    })).filter((v) => v.videoId);
  } catch {
    return [];
  }
}
