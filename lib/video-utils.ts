/**
 * Converts a YouTube or Vimeo URL to an embeddable URL
 * @param url - The video URL (YouTube, Vimeo, or direct embed URL)
 * @returns The embeddable URL or the original URL if it's already embeddable
 */
export function getEmbedUrl(url: string): string {
  if (!url) return ""

  // If it's already an embed URL, return it
  if (url.includes("/embed/") || url.includes("player.vimeo.com")) {
    return url
  }

  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }

  // Vimeo patterns
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  // If no pattern matches, return the original URL
  return url
}

/**
 * Checks if a URL is a valid video URL
 * @param url - The URL to check
 * @returns true if the URL is a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
  if (!url) return false
  
  const videoPatterns = [
    /youtube\.com/,
    /youtu\.be/,
    /vimeo\.com/,
    /player\.vimeo\.com/,
    /\/embed\//,
  ]
  
  return videoPatterns.some(pattern => pattern.test(url))
}
