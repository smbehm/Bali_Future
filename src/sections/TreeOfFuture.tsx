import { motion } from 'framer-motion';
import SectionErrorBoundary from '../components/SectionErrorBoundary';
import DonationTreeIframe from '../components/DonationTreeIframe';

export default function TreeOfFuture() {
  return (
    <section id="tree-of-future" className="section-padding relative overflow-hidden">
      <motion.div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-8 max-w-3xl text-center md:mb-12"
        >
          <h2 className="font-sora font-bold text-3xl md:text-5xl text-tropical mb-6">
            Donation Tree
          </h2>
          <p className="text-dark/60 text-base leading-relaxed text-pretty sm:text-lg">
            The Donation Tree represents our most current and pressing fundraising goal for the most
            mission critical objective. This is a way to support an exact fix/repair.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full min-w-0 overflow-hidden rounded-3xl"
        >
          <SectionErrorBoundary sectionName="Donation Tree">
            <DonationTreeIframe />
          </SectionErrorBoundary>
        </motion.div>
      </motion.div>
    </section>
  );
}
