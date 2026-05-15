/** Standard YouTube video id: 11 characters, alphanumeric plus _ and - */
export function isValidYoutubeVideoId(videoId: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

/** Hover embed — autoplay with sound, minimal YouTube chrome. */
export function youtubeCardEmbedUrl(
  videoId: string,
  options: { muted?: boolean; origin?: string } = {},
): string {
  const { muted = false, origin } = options;
  const params = new URLSearchParams({
    autoplay: '1',
    mute: muted ? '1' : '0',
    loop: '1',
    playlist: videoId,
    controls: '0',
    playsinline: '1',
    modestbranding: '1',
    rel: '0',
    showinfo: '0',
    iv_load_policy: '3',
    fs: '0',
    disablekb: '1',
    cc_load_policy: '0',
  });
  if (origin) {
    params.set('origin', origin);
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/** @deprecated Use youtubeCardEmbedUrl */
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

/** Events activity cards — order: Football → Computer Day → Basketball → Painting → Singing → Dancing */
export const EVENTS_YOUTUBE = {
  football: '3aEgg9pj_DY',
  computerDay: 'JXNzNkOxklU',
  basketball: '6zrT6zDjltU',
  painting: 'hSREFTWK0h4',
  singing: 'b6nn6t9X62E',
  dancing: 'fdv4TGkL-wU',
} as const;

/** Gallery “See the Difference You Make” stat cards */
export const GALLERY_YOUTUBE = {
  children: '9T-9MWcET0U',
  homes: 'dgDtnlfV3v0',
  impact: 'MeNbGmgXhLY',
  lives: 'scLzTS5CoAQ',
} as const;
