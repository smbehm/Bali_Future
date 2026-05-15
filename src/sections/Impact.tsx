import { motion } from 'framer-motion';
import { Heart, Utensils, Users, TreePine, Building2, BookOpen } from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';

const impactStats = [
  { end: 40, label: 'Children in Our Care', icon: <Heart className="h-7 w-7 text-primary-500" strokeWidth={1.5} /> },
  { end: 4380, suffix: '+', label: 'Meals Served', icon: <Utensils className="h-7 w-7 text-warm-500" strokeWidth={1.5} /> },
  { end: 25, suffix: '+', label: 'Volunteers United', icon: <Users className="h-7 w-7 text-sky-400" strokeWidth={1.5} /> },
  { end: 6, label: 'Homes We Support', icon: <TreePine className="h-7 w-7 text-primary-600" strokeWidth={1.5} /> },
  {
    end: 100,
    suffix: '%',
    label: 'Donations Go to Children',
    icon: <Building2 className="h-7 w-7 text-ocean" strokeWidth={1.5} />,
  },
  { end: 3, label: 'Learning Programs', icon: <BookOpen className="h-7 w-7 text-warm-400" strokeWidth={1.5} /> },
];

const timeline = [
  { year: '2021', title: 'A Dream Takes Root', desc: 'Bali Future was founded after visiting the Bali Life Foundation shelter — home to 100+ children aged 3-18 who had been orphaned, abandoned, or abused. We saw their potential and knew we had to act.' },
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

        <div className="mb-24 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6 lg:gap-8">
          {impactStats.map((stat) => (
            <AnimatedCounter key={stat.label} {...stat} />
          ))}
        </div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <h3 className="font-sora font-bold text-2xl md:text-3xl text-tropical text-center mb-12">
            Our Journey
          </h3>

          <div className="hidden md:block absolute left-1/2 top-24 bottom-0 w-px bg-gradient-to-b from-primary-200 via-primary-300 to-primary-100" />

          <div className="space-y-8 md:space-y-0">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`md:flex items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} mb-8`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                  <div className="p-6 rounded-2xl glass hover-lift inline-block max-w-sm">
                    <span className="font-sora font-bold text-primary-300 text-lg">{item.year}</span>
                    <h4 className="font-sora font-bold text-tropical mt-1">{item.title}</h4>
                    <p className="text-dark/60 text-sm mt-2">{item.desc}</p>
                  </div>
                </div>
                <div className="hidden md:flex w-4 h-4 rounded-full bg-primary-300 border-4 border-cream shadow-lg flex-shrink-0 relative z-10" />
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
