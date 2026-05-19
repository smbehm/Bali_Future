import { useEffect, useState } from 'react';

type SectionInViewOptions = {
  threshold?: number;
  rootMargin?: string;
};

/**
 * Tracks whether an element with the given id intersects the viewport.
 * Used to avoid running multiple WebGL scenes at once.
 */
export function useSectionInView(
  sectionId: string,
  { threshold = 0.08, rootMargin = '0px' }: SectionInViewOptions = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = document.getElementById(sectionId);
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold, rootMargin },
    );
    observer.observe(el);

    // Some mobile browsers defer the first IO callback; sync once after layout.
    const syncId = requestAnimationFrame(() => {
      const records = observer.takeRecords();
      if (records.length > 0) {
        setInView(Boolean(records[0]?.isIntersecting));
      }
    });

    return () => {
      cancelAnimationFrame(syncId);
      observer.disconnect();
    };
  }, [sectionId, threshold, rootMargin]);

  return inView;
}
