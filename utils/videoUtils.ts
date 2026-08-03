/**
 * Utility functions for parsing and rendering video URLs (YouTube, Vimeo, MP4/Direct, Blob)
 */

export interface VideoItem {
  id?: string;
  title: string;
  badge?: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  details?: string;
}

export function parseVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'iframe' | 'direct'; embedUrl: string; youtubeId?: string } {
  if (!url) return { type: 'direct', embedUrl: '' };

  const cleanUrl = url.trim();

  // YouTube (standard, shorts, share links, embed)
  const youtubeMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
  if (youtubeMatch && youtubeMatch[1]) {
    return {
      type: 'youtube',
      youtubeId: youtubeMatch[1],
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0&modestbranding=1`
    };
  }

  // Vimeo
  const vimeoMatch = cleanUrl.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
    };
  }

  // Google Drive preview links
  const driveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'iframe',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    };
  }

  // External website embed link
  if (cleanUrl.includes('/embed/') || cleanUrl.includes('player.') || cleanUrl.includes('iframe')) {
    return {
      type: 'iframe',
      embedUrl: cleanUrl
    };
  }

  // Direct MP4 / WebM / Video file
  return {
    type: 'direct',
    embedUrl: cleanUrl
  };
}

export function getAutoThumbnail(url: string, existingThumb?: string): string {
  if (existingThumb && existingThumb.trim().length > 0) {
    return existingThumb.trim();
  }
  const parsed = parseVideoUrl(url);
  if (parsed.type === 'youtube' && parsed.youtubeId) {
    return `https://img.youtube.com/vi/${parsed.youtubeId}/hqdefault.jpg`;
  }
  return '';
}

