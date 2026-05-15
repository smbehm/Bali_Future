import { motion } from 'framer-motion';
import { GraduationCap, Leaf, Heart, Home, Sun, Shield } from 'lucide-react';

const pillars = [
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'Education',
    description: 'Every child deserves the chance to learn and dream. We provide school supplies, tutoring, and safe learning spaces where curiosity thrives.',
    color: 'from-sky-300 to-ocean',
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    title: 'Sustainability',
    description: 'We teach children to be stewards of the land they love -- growing food, planting trees, and protecting the island that sustains them.',
    color: 'from-primary-300 to-tropical',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Nutrition & Health',
    description: 'A hungry child cannot focus. We ensure every child in our care receives nutritious meals, clean water, and access to medical support.',
    color: 'from-warm-300 to-warm-500',
  },
  {
    icon: <Home className="w-6 h-6" />,
    title: 'Safe Shelter',
    description: 'We provide stable, loving environments where children feel secure -- because healing and growth begin where fear ends.',
    color: 'from-primary-200 to-primary-400',
  },
  {
    icon: <Sun className="w-6 h-6" />,
    title: 'Empowerment',
    description: 'We help families build self-sustaining futures through skills training, micro-enterprise support, and mentorship programs.',
    color: 'from-warm-200 to-warm-400',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Protection',
    description: 'Every child deserves to feel safe. We advocate for children\'s rights and provide the emotional support they need to heal and grow.',
    color: 'from-sky-200 to-sky-400',
  },
];

function MissionVisual() {
  return (
    <div className="absolute top-0 right-0 w-[400px] h-[500px] pointer-events-none opacity-[0.06] hidden lg:block">
      <svg viewBox="0 0 300 400" fill="none" className="w-full h-full">
        {/* Adult holding child's hand - abstract */}
        <path d="M150 380 L150 280 C150 260 140 250 135 240 L130 220" stroke="#2f5d50" strokeWidth="3" strokeLinecap="round" />
        <path d="M150 280 C160 260 165 250 170 240 L175 220" stroke="#2f5d50" strokeWidth="3" strokeLinecap="round" />
        <circle cx="150" cy="200" r="20" fill="#2f5d50" />

        {/* Child figure */}
        <path d="M200 380 L200 320 C200 310 195 305 192 298" stroke="#2f5d50" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="200" cy="280" r="14" fill="#2f5d50" />

        {/* Connecting hands */}
        <path d="M170 240 C180 250 185 260 192 270" stroke="#2f5d50" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />

        {/* Growth lines / hopeful rays */}
        <path d="M160 180 L155 150" stroke="#7bc47f" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
        <path d="M170 185 L180 158" stroke="#7bc47f" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
        <path d="M140 185 L125 160" stroke="#7bc47f" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
      </svg>
    </div>
  );
}

export default function Mission() {
  return (
    <section id="mission" className="section-padding relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-50/50 blur-[80px]" />
      <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] rounded-full bg-sky-50/30 blur-[60px]" />

      <div className="max-w-7xl mx-auto relative">
        <MissionVisual />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-4">
            Our Mission
          </span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl text-tropical mb-6">
            Bringing Hope Home to Every Child
          </h2>
          <p className="text-dark/60 text-lg leading-relaxed">
            We believe in a world where children without families still grow up in supportive,
            loving environments. The shelter serves children aged 3-18 from across Bali and Indonesia.
            Our mission is physical, spiritual, and emotional guidance alongside education, with the
            goal of empowering children to become independent, responsible citizens. Through the
            Inspire The Youth initiative, we teach kids CAD design, Adobe Photoshop, and other creative
            tools. By meeting their most basic needs — food, shelter, and unconditional care — we help
            them discover their potential and pursue their dreams.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-8 rounded-3xl glass hover-lift cursor-default relative overflow-hidden"
            >
              {/* Subtle glow on hover */}
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-primary-200/0 group-hover:bg-primary-200/20 blur-2xl transition-all duration-500" />

              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {pillar.icon}
              </div>
              <h3 className="font-sora font-bold text-xl text-tropical mb-3">
                {pillar.title}
              </h3>
              <p className="text-dark/60 leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Emotional quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-20 max-w-2xl mx-auto"
        >
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent mx-auto mb-6" />
          <p className="font-sora text-xl md:text-2xl text-tropical/70 italic leading-relaxed">
            "There is nothing more meaningful than giving a child the security to dream and the support to reach those dreams."
          </p>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent mx-auto mt-6" />
        </motion.div>
      </div>
    </section>
  );
}
