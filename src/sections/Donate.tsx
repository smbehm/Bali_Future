import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, GraduationCap, Utensils, Stethoscope, TreePine, Gift, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import FormSuccessState from '../components/FormSuccessState';
import { formatPostgrestError, isSupabaseConfigured, supabase, SUPABASE_CONFIG_ERROR } from '../lib/supabase';
import { devLog } from '../lib/devLog';
import { formatEmailWarning, linesToEmailHtml, sendEmailNotification } from '../lib/sendEmailNotification';

const categories = [
  { id: 'education', icon: <GraduationCap className="w-5 h-5" />, label: 'Education', desc: 'Give a child the gift of learning' },
  { id: 'food', icon: <Utensils className="w-5 h-5" />, label: 'Nutrition', desc: 'No child goes to bed hungry' },
  { id: 'medical', icon: <Stethoscope className="w-5 h-5" />, label: 'Healthcare', desc: 'Ensure every child stays healthy' },
  { id: 'tree', icon: <TreePine className="w-5 h-5" />, label: 'Plant a Tree', desc: 'A living legacy of hope' },
  { id: 'general', icon: <Gift className="w-5 h-5" />, label: 'Where Most Needed', desc: 'We direct it with care' },
];

const amounts = [25, 50, 100, 250, 500, 1000];

export default function Donate() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'one_time' | 'monthly'>('one_time');
  const [category, setCategory] = useState('general');
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetSuccess = useCallback(() => {
    setSubmitted(false);
    setStep(1);
    setSubmitError(null);
    setSubmitWarning(null);
    setWhatsappMessage(null);
  }, []);

  const parsedCustom = parseFloat(customAmount.replace(/,/g, '').trim());
  const finalAmount =
    customAmount.trim() !== '' && Number.isFinite(parsedCustom) && parsedCustom > 0
      ? Math.round(parsedCustom * 100) / 100
      : amount;

  const handleSubmit = async () => {
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) return;
    if (isSubmitting) return;

    setSubmitError(null);
    setSubmitWarning(null);

    if (!isSupabaseConfigured()) {
      console.error('[donations] Supabase not configured at runtime');
      setSubmitError(SUPABASE_CONFIG_ERROR);
      return;
    }

    setIsSubmitting(true);

    const row = {
      donor_name: anonymous ? 'Anonymous' : name,
      donor_email: email,
      amount: finalAmount,
      type,
      category,
      message,
      is_anonymous: anonymous,
    };
    devLog('[donations] insert', { ...row, donor_email: row.donor_email ? '(set)' : '(empty)' });

    const { error } = await supabase.from('donations').insert({
      donor_name: anonymous ? 'Anonymous' : name,
      donor_email: email,
      amount: finalAmount,
      type,
      category,
      message,
      is_anonymous: anonymous,
    });

    if (error) {
      console.error('[donations] Supabase insert failed', error);
      setSubmitError(formatPostgrestError(error));
      setIsSubmitting(false);
      return;
    }

    if (message && category === 'tree') {
      const { error: leafError } = await supabase.from('tree_leaves').insert({
        donor_name: anonymous ? 'Anonymous' : name,
        message,
        amount: finalAmount,
      });
      if (leafError) console.error('[tree_leaves]', leafError);
    }

    const categoryLabel = categories.find((c) => c.id === category)?.label ?? category;
    const donorDisplay = anonymous ? 'Anonymous' : (name.trim() || 'Donor');
    const typeLabel = type === 'monthly' ? 'Monthly' : 'One-time';
    const orgSubject = `New Donation — $${finalAmount} from ${donorDisplay}`;
    const orgHtml = linesToEmailHtml([
      `Amount: $${finalAmount}`,
      `Category: ${categoryLabel}`,
      `Type: ${typeLabel}`,
      `Donor name: ${donorDisplay}`,
      `Email: ${email.trim()}`,
      `Message: ${message.trim() ? message.trim() : '—'}`,
    ]);

    const donorEmailTrim = email.trim();
    const donorConfirmation =
      donorEmailTrim.includes('@')
        ? {
            to: donorEmailTrim,
            subject: 'Thank you — Bali Future received your gift',
            html: linesToEmailHtml(
              [
                'Thank you for standing with the children of Bali.',
                '',
                `Amount: $${finalAmount}`,
                `Designation: ${categoryLabel}`,
                `Frequency: ${typeLabel}`,
                anonymous
                  ? 'You chose to give anonymously — we are grateful.'
                  : `Name on record: ${name.trim() || '—'}`,
                message.trim() ? `Your message to the children: ${message.trim()}` : '',
              ].filter((line) => line !== ''),
            ),
          }
        : null;

    const emailResult = await sendEmailNotification({
      organization: { subject: orgSubject, html: orgHtml },
      donor: donorConfirmation,
    });
    if (!emailResult.ok) {
      console.error('[donations] email notification failed', emailResult);
      setSubmitWarning(formatEmailWarning(emailResult));
    }

    setWhatsappMessage(
      `New donation received: $${finalAmount} from ${anonymous ? 'Anonymous' : name} category: ${category}`,
    );
    setSubmitted(true);
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!submitted) return;
    const t = window.setTimeout(resetSuccess, 12000);
    return () => window.clearTimeout(t);
  }, [submitted, resetSuccess]);

  return (
    <section
      id="donate"
      className={`section-padding relative bg-gradient-to-b from-cream/55 via-primary-50/15 to-cream/55 ${
        submitted ? 'overflow-x-clip' : 'overflow-hidden'
      }`}
    >
      {!submitted && (
        <div className="decorative-blur absolute top-0 right-0 h-[min(600px,100vh)] w-[min(600px,100vw)] rounded-full bg-primary-50/40 blur-[100px]" />
      )}

      {submitted ? (
        <div className="section-container relative">
          <FormSuccessState
            title="You Just Changed a Life"
            message={
              <>
                Your ${finalAmount} gift to {categories.find((c) => c.id === category)?.label} goes directly to
                children in Bali who need it most. Because of you, a child will eat, learn, and dream tonight.
              </>
            }
            warning={submitWarning}
            whatsappMessage={whatsappMessage}
            accent="green"
            resetLabel="Make Another Donation"
            onReset={resetSuccess}
          />
        </div>
      ) : (
      <div className="mx-auto w-full min-w-0 max-w-4xl relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-4">
            <Heart className="w-4 h-4" />
            100% Goes to the Children
          </span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl text-tropical mb-4">
            Change a Child's Life Today
          </h2>
          <p className="text-dark/60 text-lg max-w-2xl mx-auto">
            Your donation provides nourishment, education, and a safe environment for
            children who have no one else to turn to. Every dollar makes a tremendous difference.
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s ? 'gradient-green text-white shadow-lg shadow-primary-300/30' : 'bg-primary-50 text-dark/40'
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 md:w-20 h-1 rounded-full transition-all ${step > s ? 'bg-primary-300' : 'bg-primary-50'}`} />}
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="bg-white rounded-3xl shadow-xl shadow-primary-100/50 p-6 sm:p-8 md:p-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-sora font-bold text-xl text-tropical mb-6">Choose How You Want to Help</h3>

                {/* Type toggle */}
                <div className="flex gap-2 p-1 rounded-xl bg-primary-50 w-fit mb-8">
                  <button
                    onClick={() => setType('one_time')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      type === 'one_time' ? 'bg-white text-tropical shadow-md' : 'text-dark/50'
                    }`}
                  >
                    One-Time
                  </button>
                  <button
                    onClick={() => setType('monthly')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      type === 'monthly' ? 'bg-white text-tropical shadow-md' : 'text-dark/50'
                    }`}
                  >
                    Monthly
                  </button>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-4 rounded-2xl border-2 text-center transition-all hover-lift ${
                        category === cat.id
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-transparent bg-gray-50 hover:border-primary-100'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2 ${
                        category === cat.id ? 'gradient-green text-white' : 'bg-white text-dark/50'
                      }`}>
                        {cat.icon}
                      </div>
                      <div className="text-xs font-semibold text-tropical">{cat.label}</div>
                    </button>
                  ))}
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                  {amounts.map((a) => (
                    <button
                      key={a}
                      onClick={() => { setAmount(a); setCustomAmount(''); }}
                      className={`py-3 rounded-xl text-center font-bold transition-all ${
                        amount === a && !customAmount
                          ? 'gradient-green text-white shadow-lg shadow-primary-300/30'
                          : 'bg-gray-50 text-dark/70 hover:bg-primary-50'
                      }`}
                    >
                      ${a}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/40 font-bold">$</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Custom amount"
                    className="form-field w-full pl-8 pr-4 py-3 rounded-xl border-2 border-primary-100 focus:border-primary-300 outline-none transition-colors"
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="mt-8 w-full flex items-center justify-center gap-2 py-4 rounded-xl gradient-green text-white font-semibold shadow-lg shadow-primary-300/30 hover:shadow-xl transition-all"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-sora font-bold text-xl text-tropical mb-6">Your Information</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-dark/70 mb-1 block">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="form-field w-full px-4 py-3 rounded-xl border-2 border-primary-100 focus:border-primary-300 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark/70 mb-1 block">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="form-field w-full px-4 py-3 rounded-xl border-2 border-primary-100 focus:border-primary-300 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark/70 mb-1 block">Message (optional)</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share a word of encouragement for the children..."
                      rows={3}
                      className="form-field w-full px-4 py-3 rounded-xl border-2 border-primary-100 focus:border-primary-300 outline-none transition-colors resize-none"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                      className="w-5 h-5 rounded border-primary-200 text-primary-300 focus:ring-primary-200"
                    />
                    <span className="text-sm text-dark/60">Make my donation anonymous</span>
                  </label>
                </div>

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl glass text-tropical font-semibold hover:bg-white/80 transition-colors sm:justify-start"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!name || !email}
                    className="flex flex-1 items-center justify-center gap-2 py-4 rounded-xl gradient-green text-white font-semibold shadow-lg shadow-primary-300/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Review Donation
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-sora font-bold text-xl text-tropical mb-6">Confirm Your Donation</h3>

                <div className="bg-primary-50/50 rounded-2xl p-6 mb-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-dark/60">Amount</span>
                    <span className="font-bold text-tropical">${finalAmount} {type === 'monthly' ? '/month' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark/60">Category</span>
                    <span className="font-medium text-tropical">{categories.find(c => c.id === category)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark/60">Donor</span>
                    <span className="font-medium text-tropical">{anonymous ? 'Anonymous' : name}</span>
                  </div>
                  {message && (
                    <div className="pt-3 border-t border-primary-100">
                      <span className="text-dark/60 text-sm">Message:</span>
                      <p className="text-tropical italic mt-1">"{message}"</p>
                    </div>
                  )}
                </div>

                {submitError ? (
                  <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {submitError}
                  </p>
                ) : null}

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitError(null);
                      setStep(2);
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl glass text-tropical font-semibold hover:bg-white/80 transition-colors sm:justify-start"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex flex-1 items-center justify-center gap-2 py-4 rounded-xl gradient-green text-white font-semibold shadow-lg shadow-primary-300/30 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Heart className="w-5 h-5" />
                    Complete Donation
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      )}
    </section>
  );
}
