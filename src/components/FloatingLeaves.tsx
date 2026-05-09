import { useEffect, useRef } from 'react';

export default function FloatingLeaves() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const leaves: HTMLDivElement[] = [];
    const leafCount = 10;

    const leafSVG = (hue: number, opacity: number) => `
      <svg width="18" height="24" viewBox="0 0 18 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 0 C14 5 18 12 15 19 C12 24 6 24 3 19 C0 12 4 5 9 0Z"
          fill="hsl(${hue}, 55%, 55%)" fill-opacity="${opacity}" />
        <path d="M9 2 L9 20" stroke="hsl(${hue}, 40%, 35%)" stroke-width="0.5" stroke-opacity="0.3" />
        <path d="M9 8 L6 6" stroke="hsl(${hue}, 40%, 35%)" stroke-width="0.3" stroke-opacity="0.2" />
        <path d="M9 12 L12 10" stroke="hsl(${hue}, 40%, 35%)" stroke-width="0.3" stroke-opacity="0.2" />
      </svg>
    `;

    for (let i = 0; i < leafCount; i++) {
      const leaf = document.createElement('div');
      leaf.className = 'absolute pointer-events-none';
      leaf.style.left = `${Math.random() * 100}%`;
      leaf.style.top = `${-5 - Math.random() * 10}%`;

      const hue = 130 + Math.random() * 30;
      const opacity = 0.25 + Math.random() * 0.3;
      leaf.innerHTML = leafSVG(hue, opacity);

      const duration = 12 + Math.random() * 18;
      const delay = Math.random() * 15;
      const swayAmount = 30 + Math.random() * 50;

      leaf.style.animation = `leafFall ${duration}s linear ${delay}s infinite`;
      leaf.style.setProperty('--sway', `${swayAmount}px`);

      container.appendChild(leaf);
      leaves.push(leaf);
    }

    return () => {
      leaves.forEach((leaf) => leaf.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
    />
  );
}
