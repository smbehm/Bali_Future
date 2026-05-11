import { motion } from 'framer-motion';
import { Heart, Utensils, Users, TreePine, Building, BookOpen } from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';

const stats = [
  { end: 2400, suffix: '+', label: 'Children in Our Care', icon: <Heart className="w-6 h-6 text-primary-300" /> },
  { end: 185000, suffix: '+', label: 'Meals Served', icon: <Utensils className="w-6 h-6 text-warm-400" /> },
  { end: 890, suffix: '+', label: 'Volunteers United', icon: <Users className="w-6 h-6 text-sky-300" /> },
  { end: 12500, suffix: '+', label: 'Trees Planted', icon: <TreePine className="w-6 h-6 text-primary-400" /> },
  { end: 67, label: 'Community Projects', icon: <Building className="w-6 h-6 text-ocean" /> },
  { end: 45, label: 'Learning Programs', icon: <BookOpen className="w-6 h-6 text-warm-300" /> },
];

const timeline = [
  { year: '2018', title: 'A Dream Takes Root', desc: 'Bali Future was founded by a small group who refused to look away from children in need.' },
  { year: '2019', title: 'First Learning Center', desc: 'We opened our doors in rural Ubud -- 32 children walked in on the first day.' },
  { year: '2020', title: 'Adapting with Resilience', desc: 'When the world shut down, we delivered meals, learning kits, and hope to isolated families.' },
  { year: '2022', title: 'Growing Together', desc: 'Launched sustainability programs, planting trees alongside the children who will inherit them.' },
  { year: '2024', title: 'A Global Family', desc: 'Supporters from 18 countries joined our mission -- proving compassion knows no borders.' },
  { year: '2026', title: 'The Future Is Theirs', desc: 'Every day, more children discover they are worthy of love, capable of greatness.' },
];

export default function Impact() {
  return (
    <section id="impact" className="section-padding relative overflow-hidden bg-gradient-to-b from-cream via-primary-50/30 to-cream">
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] rounded-full bg-sky-50/50 blur-[100px] -translate-x-1/2" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-sm font-semibold mb-4">
            Our Impact
          </span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl text-tropical mb-6">
            Your Generosity, Their Transformation
          </h2>
          <p className="text-dark/60 text-lg">
            Behind every number is a child who now eats three meals a day, a family that stays
            together, a community that believes in tomorrow.
          </p>
        </motion.div>

        {/* Counters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-24">
          {stats.map((stat) => (
            <AnimatedCounter key={stat.label} {...stat} />
          ))}
        </div>

        {/* Timeline — centered vertical line + alternating cards (md+); stacked with left rail (mobile) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto"
        >
          <h3 className="font-sora font-bold text-2xl md:text-3xl text-tropical text-center mb-12">
            Our Journey
          </h3>

          {/* Center spine — desktop only */}
          <div
            className="hidden md:block absolute left-1/2 -translate-x-1/2 top-14 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-primary-300 to-primary-100 pointer-events-none"
            aria-hidden
          />

          <div className="relative space-y-8 md:space-y-14">
            {timeline.map((item, i) => {
              const isLeft = i % 2 === 0;
              const cardInner = (
                <>
                  <span className="font-sora font-bold text-lg text-primary-500">{item.year}</span>
                  <h4 className="font-sora font-bold text-tropical mt-1">{item.title}</h4>
                  <p className="text-dark/60 text-sm mt-2">{item.desc}</p>
                </>
              );

              return (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative"
                >
                  {/* Mobile: vertical line + dot + card */}
                  <div className="md:hidden relative pl-9 border-l-2 border-primary-200 ml-1">
                    <div className="absolute left-0 top-3 -translate-x-1/2 w-4 h-4 rounded-full bg-primary-300 border-4 border-cream shadow-md z-10" />
                    <div className="p-6 rounded-2xl glass hover-lift">{cardInner}</div>
                  </div>

                  {/* Desktop: alternating halves + center dot on axis */}
                  <div className="hidden md:flex flex-row items-center w-full">
                    <div className="w-1/2 flex justify-end pr-8 lg:pr-12">
                      {isLeft ? (
                        <div className="p-6 rounded-2xl glass hover-lift w-full max-w-sm text-right">{cardInner}</div>
                      ) : (
                        <div className="w-full max-w-sm" aria-hidden />
                      )}
                    </div>
                    <div className="w-12 flex-shrink-0 flex justify-center relative z-10">
                      <div className="w-4 h-4 rounded-full bg-primary-300 border-4 border-cream shadow-lg ring-2 ring-primary-200/40" />
                    </div>
                    <div className="w-1/2 flex justify-start pl-8 lg:pl-12">
                      {!isLeft ? (
                        <div className="p-6 rounded-2xl glass hover-lift w-full max-w-sm text-left">{cardInner}</div>
                      ) : (
                        <div className="w-full max-w-sm" aria-hidden />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
