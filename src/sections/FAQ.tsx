import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Where does my donation go?',
    a: 'Every dollar goes directly to the children: education (40%), nutrition and shelter (25%), healthcare (20%), and sustainability programs (15%). We publish annual impact reports so you can see exactly how your generosity is at work.',
  },
  {
    q: 'Can I sponsor a specific child?',
    a: 'Yes. Through our Child Sponsorship program, you personally support one child\'s education, nutrition, and healthcare. You\'ll receive regular updates, photos, and letters so you can watch them grow and thrive.',
  },
  {
    q: 'What will I do as a volunteer?',
    a: 'From teaching English and art, to building classrooms, tending gardens, and leading ocean cleanups -- we match your skills to where they are needed most. Programs range from 1 week to 6+ months.',
  },
  {
    q: 'Is Bali Future a registered nonprofit?',
    a: 'Yes. We are a registered 501(c)(3) organization with full financial transparency. All donations are tax-deductible and we maintain top ratings from independent charity evaluators.',
  },
  {
    q: 'How can my company make a difference?',
    a: 'We partner with organizations through team volunteer trips, child sponsorships, and cause-aligned campaigns. Many companies adopt a classroom or fund a specific project. Contact us to design a partnership that reflects your values.',
  },
  {
    q: 'How do I know my support is making an impact?',
    a: 'Since 2018, we have cared for over 2,400 children, planted 12,500+ trees, served 185,000+ meals, and completed 67 community projects. But the truest measure is a child who goes to sleep safe and wakes up believing in their future.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="section-padding relative overflow-hidden">
      <div className="section-container mx-auto w-full min-w-0 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-sm font-semibold mb-4">
            <HelpCircle className="w-4 h-4" />
            Your Questions Answered
          </span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl text-tropical mb-4">
            Everything You Need to Know
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className={`w-full min-h-[56px] touch-manipulation rounded-2xl p-5 text-left transition-all sm:p-6 ${
                  open === i ? 'bg-white shadow-lg shadow-primary-100/50' : 'glass hover:bg-white/80'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="min-w-0 flex-1 text-left font-sora font-semibold text-tropical leading-snug pr-2">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary-300 flex-shrink-0 transition-transform ${
                      open === i ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="mt-4 text-sm leading-relaxed text-pretty text-dark/60 md:text-base">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
