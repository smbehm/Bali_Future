/** Build a YouTube embed URL for background cards (muted autoplay loop). */
export function youtubeEmbedUrl(
  videoId: string,
  options: { autoplay?: boolean; muted?: boolean; loop?: boolean } = {},
): string {
  const { autoplay = true, muted = true, loop = true } = options;
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: muted ? '1' : '0',
    loop: loop ? '1' : '0',
    playlist: loop ? videoId : '',
    controls: '0',
    playsinline: '1',
    modestbranding: '1',
    rel: '0',
    enablejsapi: '0',
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function youtubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/** Bali Future shelter stories on YouTube (same IDs as Orphanage Homes section). */
export const SHELTER_YOUTUBE = {
  hopeHome: 'B6GnSJkj4SI',
  education: 'Bik2-QjACWM',
  volunteers: '4K4vTQEYBXg',
} as const;
