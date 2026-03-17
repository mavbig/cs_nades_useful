const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '';

export function getMediaUrl(relPath: string | null | undefined): string {
  if (!relPath) return '';
  if (relPath.startsWith('http')) return relPath;
  // If it's a relative path like "media/uuid/screenshot.jpg", append to base URL
  const path = relPath.startsWith('/') ? relPath.slice(1) : relPath;
  return `${MEDIA_BASE_URL}/${path}`;
}

export function getMapImageUrl(slug: string): string {
  const isDust2 = slug === 'dust2';
  return `/maps/${slug}${isDust2 ? '.jpg' : '.png'}`;
}
