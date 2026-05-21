import { useEffect, useRef, useState } from 'react';

const IFRAME_SRC = 'https://donation-tree-2.vercel.app/?v=2';

/**
 * Loads the donation-tree embed only when scrolled near — avoids a second WebGL app on initial load (critical on iOS Safari).
 */
export default function DonationTreeIframe() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSrc(IFRAME_SRC);
          observer.disconnect();
        }
      },
      { rootMargin: '120px 0px', threshold: 0.01 },
    );

    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="w-full bg-[#040b06]" style={{ minHeight: 'clamp(360px, 58svh, 680px)' }}>
      {src ? (
        <iframe
          src={src}
          style={{ width: '100%', height: 'clamp(360px, 58svh, 680px)', border: 'none', display: 'block' }}
          title="Donation Tree"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : null}
    </div>
  );
}
