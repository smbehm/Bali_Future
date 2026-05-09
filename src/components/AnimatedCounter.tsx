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

export default function AnimatedCounter({ end, duration = 2, prefix = '', suffix = '', label, icon }: Props) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center"
    >
      <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4 shadow-lg">
        {icon}
      </div>
      <div className="font-sora font-bold text-3xl md:text-4xl text-tropical">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-dark/60 mt-2 font-medium">{label}</div>
    </motion.div>
  );
}
