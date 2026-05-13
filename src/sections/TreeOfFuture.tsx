import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TreeLeaf {
  id: string;
  donor_name: string;
  message: string;
  amount: number;
  created_at: string;
}

export default function TreeOfFuture() {
  const [leaves, setLeaves] = useState<TreeLeaf[]>([]);
  const [selectedLeaf, setSelectedLeaf] = useState<TreeLeaf | null>(null);

  useEffect(() => {
    async function fetchLeaves() {
      const { data } = await supabase
        .from('tree_leaves')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setLeaves(data);
    }
    fetchLeaves();
  }, []);

  const leafPositions = [
    { x: 45, y: 15 }, { x: 55, y: 20 }, { x: 35, y: 25 },
    { x: 60, y: 28 }, { x: 40, y: 32 }, { x: 52, y: 18 },
    { x: 30, y: 35 }, { x: 65, y: 35 }, { x: 48, y: 22 },
    { x: 38, y: 28 }, { x: 58, y: 25 }, { x: 42, y: 38 },
    { x: 55, y: 32 }, { x: 33, y: 30 }, { x: 62, y: 22 },
    { x: 50, y: 28 }, { x: 37, y: 20 }, { x: 57, y: 38 },
    { x: 43, y: 15 }, { x: 53, y: 35 },
  ];

  return (
    <section className="section-padding relative overflow-hidden bg-gradient-to-b from-cream/55 via-tropical/5 to-cream/55">
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            A Living Monument to Kindness
          </span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl text-tropical mb-6">
            The Tree of Future
          </h2>
          <p className="text-dark/60 text-lg">
            Every leaf represents someone who chose to stand with our children. Click
            a leaf to read their message -- and know that your name could be here too,
            growing alongside theirs.
          </p>
        </motion.div>

        {/* Tree visualization */}
        <div className="relative w-full max-w-4xl mx-auto aspect-[4/5] md:aspect-[3/4]">
          {/* Trunk */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 md:w-12 h-[45%] rounded-t-full bg-gradient-to-t from-warm-700 via-warm-600 to-warm-500 opacity-60" />

          {/* Roots */}
          <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[15%] opacity-30" viewBox="0 0 200 50">
            <path d="M100 0 C80 20 40 30 20 45" stroke="#92400e" strokeWidth="3" fill="none" />
            <path d="M100 0 C120 20 160 30 180 45" stroke="#92400e" strokeWidth="3" fill="none" />
            <path d="M100 0 C90 15 60 25 50 40" stroke="#92400e" strokeWidth="2" fill="none" />
            <path d="M100 0 C110 15 140 25 150 40" stroke="#92400e" strokeWidth="2" fill="none" />
          </svg>

          {/* Canopy glow */}
          <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[80%] h-[55%] rounded-full bg-primary-200/20 blur-[40px]" />

          {/* Canopy shape */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="absolute top-[5%] left-[15%] right-[15%] h-[55%]"
          >
            <svg viewBox="0 0 300 250" className="w-full h-full" fill="none">
              <ellipse cx="150" cy="125" rx="140" ry="120" fill="#7bc47f" fillOpacity="0.15" />
              <ellipse cx="120" cy="140" rx="100" ry="95" fill="#2f5d50" fillOpacity="0.08" />
              <ellipse cx="180" cy="130" rx="90" ry="85" fill="#6ec1e4" fillOpacity="0.06" />
            </svg>
          </motion.div>

          {/* Fireflies */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`firefly-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full bg-warm-300"
              style={{
                left: `${25 + Math.random() * 50}%`,
                top: `${10 + Math.random() * 50}%`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}

          {/* Leaves (donors) */}
          {leaves.map((leaf, i) => {
            const pos = leafPositions[i % leafPositions.length];
            return (
              <motion.button
                key={leaf.id}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                whileHover={{ scale: 1.3 }}
                onClick={() => setSelectedLeaf(leaf)}
                className="absolute group"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div className="relative">
                  <Leaf className="w-6 h-6 md:w-8 md:h-8 text-primary-300 drop-shadow-lg group-hover:text-primary-400 transition-colors" />
                  <div className="absolute inset-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary-300/20 blur-md animate-pulse-soft" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Leaf modal */}
        <AnimatePresence>
          {selectedLeaf && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-tropical/30 backdrop-blur-sm"
              onClick={() => setSelectedLeaf(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full gradient-green flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-sora font-bold text-tropical">{selectedLeaf.donor_name}</h4>
                    <span className="text-sm text-dark/50">${selectedLeaf.amount} donated</span>
                  </div>
                </div>
                <p className="text-dark/70 italic leading-relaxed">"{selectedLeaf.message}"</p>
                <button
                  onClick={() => setSelectedLeaf(null)}
                  className="mt-6 w-full py-3 rounded-xl bg-primary-50 text-tropical font-semibold hover:bg-primary-100 transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
