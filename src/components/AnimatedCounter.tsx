import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface Props {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  icon: React.ReactNode;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export default function AnimatedCounter({ end, duration = 2, prefix = '', suffix = '', label, icon }: Props) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;

    setCount(0);
    const durationMs = duration * 1000;
    let start: number | null = null;
    let rafId = 0;

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min((now - start) / durationMs, 1);
      const eased = easeOutCubic(t);
      setCount(Math.round(eased * end));
      if (t < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, end, duration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center w-full min-w-0"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-black/[0.06]">
        {icon}
      </div>
      <div className="bg-transparent font-sora text-3xl font-bold text-tropical md:text-4xl tabular-nums">
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-2 max-w-[14rem] text-xs font-medium text-dark/50 md:text-sm break-words">{label}</div>
    </motion.div>
  );
}
