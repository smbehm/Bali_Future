import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const stories = [
  {
    name: 'Kadek',
    age: 10,
    image: 'https://images.pexels.com/photos/1416736/pexels-photo-1416736.jpeg?auto=compress&cs=tinysrgb&w=600',
    quote: 'Now I can read and write. I want to become a teacher so I can help other children like me.',
    story: 'When Kadek first arrived, she had never held a pencil. Today she reads aloud to younger children every evening -- her quiet way of passing on the gift she was given.',
    location: 'Ubud, Bali',
  },
  {
    name: 'Wayan',
    age: 12,
    image: 'https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=600',
    quote: 'I learned to grow vegetables and now my family always has food on the table.',
    story: 'Wayan came to us hungry and withdrawn. Through our farming program he discovered purpose -- and now feeds his entire family from the garden he tends each morning before school.',
    location: 'Tegallalang, Bali',
  },
  {
    name: 'Made',
    age: 8,
    image: 'https://images.pexels.com/photos/1619697/pexels-photo-1619697.jpeg?auto=compress&cs=tinysrgb&w=600',
    quote: 'I love painting! My art teacher says I can show my paintings to the whole world one day.',
    story: 'Made barely spoke when she joined our program. Art became her voice. Her paintings now hang in community exhibitions and have raised funds to support other children.',
    location: 'Seminyak, Bali',
  },
  {
    name: 'Putu',
    age: 11,
    image: 'https://images.pexels.com/photos/1374509/pexels-photo-1374509.jpeg?auto=compress&cs=tinysrgb&w=600',
    quote: 'Swimming in the clean river again makes me happy. We must protect our water.',
    story: 'Putu lost his father to illness linked to polluted water. Now he leads his peers in river cleanups, turning grief into action that protects his entire village.',
    location: 'Sanur, Bali',
  },
];

export default function Stories() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % stories.length);
  const prev = () => setCurrent((c) => (c - 1 + stories.length) % stories.length);

  return (
    <section id="stories" className="section-padding relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-warm-100/30 blur-[80px]" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-warm-100 text-warm-700 text-sm font-semibold mb-4">
            Real Children, Real Hope
          </span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl text-tropical mb-6">
            Meet the Children You Are Helping
          </h2>
          <p className="text-dark/60 text-lg">
            These are not just stories -- they are lives transformed by people like you
            who chose to act. Every child here was once invisible. Now they shine.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              {/* Image */}
              <div className="relative group">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-300/20 to-sky-300/20 transform rotate-3 group-hover:rotate-1 transition-transform" />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
                  <img
                    src={stories[current].image}
                    alt={stories[current].name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-tropical/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="px-3 py-1 rounded-full glass text-white text-sm font-medium">
                      {stories[current].location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center">
                <Quote className="w-10 h-10 text-primary-200 mb-4" />
                <blockquote className="font-sora text-2xl md:text-3xl font-semibold text-tropical leading-snug mb-6">
                  {stories[current].quote}
                </blockquote>
                <p className="text-dark/60 leading-relaxed mb-6">
                  {stories[current].story}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-green flex items-center justify-center text-white font-bold text-sm">
                    {stories[current].name[0]}
                  </div>
                  <div>
                    <div className="font-sora font-bold text-tropical">
                      {stories[current].name}, age {stories[current].age}
                    </div>
                    <div className="text-sm text-dark/50">Bali Future Beneficiary</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/90 transition-colors shadow-lg"
            >
              <ChevronLeft className="w-5 h-5 text-tropical" />
            </button>
            <div className="flex gap-2">
              {stories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === current ? 'bg-primary-300 w-8' : 'bg-primary-100'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/90 transition-colors shadow-lg"
            >
              <ChevronRight className="w-5 h-5 text-tropical" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
