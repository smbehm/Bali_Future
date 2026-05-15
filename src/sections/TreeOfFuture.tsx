import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const DonationTreeExperience = lazy(() => import('../components/donation-tree/DonationTreeExperience'));

function TreeEmbedFallback() {
  return (
    <div
      className="flex min-h-[300px] w-full items-center justify-center bg-[#040b06] text-sm text-primary-200/80 md:min-h-[620px]"
      aria-hidden
    >
      Loading tree…
    </div>
  );
}

export default function TreeOfFuture() {
  return (
    <section
      id="tree-of-future"
      className="section-padding relative overflow-x-clip bg-gradient-to-b from-cream/55 via-tropical/5 to-cream/55 md:overflow-hidden"
    >
      <motion.div className="section-container relative min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-8 max-w-3xl text-center md:mb-16"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-600">
            <Sparkles className="h-4 w-4" />
            A Living Monument to Kindness
          </span>
          <h2 className="mb-6 font-sora text-3xl font-bold text-tropical md:text-5xl">
            The Tree of Future
          </h2>
          <p className="text-lg text-dark/60">
            Every leaf represents someone who chose to stand with our children. Click
            a leaf to read their message -- and know that your name could be here too,
            growing alongside theirs.
          </p>
        </motion.div>

        <div className="relative -mx-6 w-[calc(100%+3rem)] min-w-0 overflow-hidden md:mx-0 md:w-full md:rounded-2xl">
          <Suspense fallback={<TreeEmbedFallback />}>
            <DonationTreeExperience />
          </Suspense>
        </div>
      </motion.div>
    </section>
  );
}
