import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function TreeOfFuture() {
  return (
    <section id="tree-of-future" className="section-padding relative overflow-hidden bg-gradient-to-b from-cream/55 via-tropical/5 to-cream/55">
      <div className="section-container relative">
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

        <iframe
          src="https://donation-tree-2.vercel.app"
          title="Donation Tree"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="w-full max-w-full border-0 min-h-[360px] h-[58vh] sm:min-h-[440px] md:h-[620px] lg:h-[700px]"
        />
      </div>
    </section>
  );
}
