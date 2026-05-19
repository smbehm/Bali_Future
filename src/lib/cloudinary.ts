/** Derive poster URL from a video path (.mp4/.mov → .jpg). Works for Cloudinary and local paths. */
export function cloudinaryPosterFromMp4(mp4Url: string): string {
  if (mp4Url.endsWith('.mp4')) {
    return `${mp4Url.slice(0, -4)}.jpg`;
  }
  if (mp4Url.endsWith('.mov')) {
    return `${mp4Url.slice(0, -4)}.jpg`;
  }
  return mp4Url.replace(/\.(mp4|mov)(\?.*)?$/i, '.jpg$2');
}

export const CLOUDINARY_EVENTS = {
  football: 'https://res.cloudinary.com/dwpbrhpso/video/upload/v1778851909/IMG_3030_cz1goo.mp4',
  computerDay:
    'https://res.cloudinary.com/dwpbrhpso/video/upload/q_auto:eco,w_720,c_limit,vc_h264/v1778855433/IMG_0074_exf4r1.mp4',
  basketball: 'https://res.cloudinary.com/dwpbrhpso/video/upload/v1778850759/C0800_zbuvtp.mp4',
  painting: 'https://res.cloudinary.com/dwpbrhpso/video/upload/v1778852110/C0794_dkyvkd.mp4',
  singing: 'https://res.cloudinary.com/dwpbrhpso/video/upload/v1778852256/IMG_3254_t5xamw.mp4',
  dancing: 'https://res.cloudinary.com/dwpbrhpso/video/upload/v1778852268/IMG_3257_jsdn4t.mp4',
} as const;

export const CLOUDINARY_GALLERY = {
  children: 'https://res.cloudinary.com/dwpbrhpso/video/upload/v1778851992/C0779_3_pa3rbz.mp4',
  homes: 'https://res.cloudinary.com/dwpbrhpso/video/upload/v1778852178/C0785_1_feq5md.mp4',
  impact: 'https://res.cloudinary.com/dwpbrhpso/video/upload/v1778852043/C0829_wbomnq.mp4',
  lives: 'https://res.cloudinary.com/dwpbrhpso/video/upload/v1778852214/IMG_5495_1_kccfpw.mp4',
} as const;

/** Lighter stream for touch devices — keeps desktop URLs unchanged. */
export function cloudinaryMobileMp4(mp4Url: string): string {
  if (!mp4Url.includes('res.cloudinary.com') || !mp4Url.includes('/video/upload/')) {
    return mp4Url;
  }
  const afterUpload = mp4Url.split('/video/upload/')[1] ?? '';
  if (afterUpload.includes(',')) {
    return mp4Url;
  }
  return mp4Url.replace(
    '/video/upload/',
    '/video/upload/q_auto:eco,w_720,c_limit,vc_h264/',
  );
}
