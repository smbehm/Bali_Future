import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, GraduationCap, Utensils, Stethoscope, TreePine, Gift, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { notifyDonationRecorded } from '../lib/sendEmailNotification';
import { isValidPhoneForWhatsApp } from '../lib/phone';
import {
  buildDonationWhatsAppUrls,
  donationDonorConfirmationMessage,
  donationOrgWhatsAppMessage,
  openWhatsAppChatsFromUserGesture,
} from '../lib/whatsapp';

const categories = [
  { id: 'education', icon: <GraduationCap className="w-5 h-5" />, label: 'Education', desc: 'Give a child the gift of learning' },
  { id: 'food', icon: <Utensils className="w-5 h-5" />, label: 'Nutrition', desc: 'No child goes to bed hungry' },
  { id: 'medical', icon: <Stethoscope className="w-5 h-5" />, label: 'Healthcare', desc: 'Ensure every child stays healthy' },
  { id: 'tree', icon: <TreePine className="w-5 h-5" />, label: 'Plant a Tree', desc: 'A living legacy of hope' },
  { id: 'general', icon: <Gift className="w-5 h-5" />, label: 'Where Most Needed', desc: 'We direct it with care' },
];

const amounts = [25, 50, 100, 250, 500, 1000];

const SUCCESS_VISIBLE_MS = 3000;

export default function Donate() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'one_time' | 'monthly'>('one_time');
  const [category, setCategory] = useState('general');
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const successTimeoutRef = useRef<number | null>(null);
  const finalAmount = customAmount ? parseFloat(customAmount) : amount;

  const resetForm = useCallback(() => {
    setStep(1);
    setType('one_time');
    setCategory('general');
    setAmount(50);
    setCustomAmount('');
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setAnonymous(false);
    setPhoneError('');
  }, []);

  const dismissSuccess = useCallback(() => {
    if (successTimeoutRef.current !== null) {
      window.clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    resetForm();
    setSubmitted(false);
  }, [resetForm]);

  useEffect(() => {
    if (!submitted) return;

    successTimeoutRef.current = window.setTimeout(() => {
      successTimeoutRef.current = null;
      resetForm();
      setSubmitted(false);
    }, SUCCESS_VISIBLE_MS);

    return () => {
      if (successTimeoutRef.current !== null) {
        window.clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
    };
  }, [submitted, resetForm]);

  const validatePhone = () => {
    if (!isValidPhoneForWhatsApp(phone)) {
      setPhoneError('Enter a valid phone number with country code (e.g. +1 415 555 0100).');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!validatePhone()) return;

    setIsSubmitting(true);

    const donorLabel = anonymous ? 'Anonymous' : name;
    const donationTypeLabel = type === 'one_time' ? 'One-time' : 'Monthly';
    const categoryLabel = categories.find((c) => c.id === category)?.label ?? category;
    const timestamp = new Date().toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    try {
      const { error } = await supabase.from('donations').insert({
        donor_name: donorLabel,
        donor_email: email,
        donor_phone: phone.trim(),
        amount: finalAmount,
        type,
        category,
        message,
        is_anonymous: anonymous,
      });

      if (error) {
        console.error(error);
        return;
      }

      void notifyDonationRecorded({
        donorEmail: email,
        donorName: donorLabel,
        amount: finalAmount,
      });

      if (message && category === 'tree') {
        await supabase.from('tree_leaves').insert({
          donor_name: donorLabel,
          message,
          amount: finalAmount,
        });
      }

      const orgMessage = donationOrgWhatsAppMessage({
        donorName: donorLabel,
        donorEmail: email,
        donorPhone: phone.trim(),
        amount: finalAmount,
        donationTypeLabel,
        categoryLabel,
        timestamp,
      });

      const donorConfirmation = donationDonorConfirmationMessage(finalAmount);
      const waUrls = buildDonationWhatsAppUrls({
        donorPhoneRaw: phone,
        orgMessage,
        donorConfirmationMessage: donorConfirmation,
      });
      openWhatsAppChatsFromUserGesture(waUrls);

      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section id="donate" className="section-padding relative overflow-hidden bg-gradient-to-b from-cream via-primary-50/20 to-cream">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-24 h-24 rounded-full gradient-green flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary-300/30"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-sora font-bold text-3xl md:text-4xl text-tropical mb-4"
          >
            You Just Changed a Life
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-dark/60 text-lg mb-8"
          >
            Your ${finalAmount} gift to {categories.find((c) => c.id === category)?.label} goes directly to
            children in Bali who need it most. Because of you, a child will eat, learn, and dream tonight.
          </motion.p>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            type="button"
            onClick={dismissSuccess}
            className="px-8 py-3 rounded-full glass text-tropical font-semibold hover:bg-white/80 transition-colors"
          >
            Make Another Donation
          </motion.button>
        </div>
      </section>
    );
  }

  return (
    <section id="donate" className="section-padding relative overflow-hidden bg-gradient-to-b from-cream via-primary-50/20 to-cream">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary-50/40 blur-[100px]" />

      <div className="max-w-4xl mx-auto relative">
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

        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s ? 'gradient-green text-white shadow-lg shadow-primary-300/30' : 'bg-primary-50 text-dark/40'
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 md:w-20 h-1 rounded-full transition-all ${step > s ? 'bg-primary-300' : 'bg-primary-50'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-primary-100/50 p-8 md:p-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-sora font-bold text-xl text-tropical mb-6">Choose How You Want to Help</h3>

                <div className="flex gap-2 p-1 rounded-xl bg-primary-50 w-fit mb-8">
                  <button
                    type="button"
                    onClick={() => setType('one_time')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      type === 'one_time' ? 'bg-white text-tropical shadow-md' : 'text-dark/50'
                    }`}
                  >
                    One-Time
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('monthly')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      type === 'monthly' ? 'bg-white text-tropical shadow-md' : 'text-dark/50'
                    }`}
                  >
                    Monthly
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-4 rounded-2xl border-2 text-center transition-all hover-lift ${
                        category === cat.id
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-transparent bg-gray-50 hover:border-primary-100'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2 ${
                          category === cat.id ? 'gradient-green text-white' : 'bg-white text-dark/50'
                        }`}
                      >
                        {cat.icon}
                      </div>
                      <div className="text-xs font-semibold text-tropical">{cat.label}</div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                  {amounts.map((a) => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => {
                        setAmount(a);
                        setCustomAmount('');
                      }}
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
                    className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-primary-100 focus:border-primary-300 outline-none transition-colors"
                  />
                </div>

                <button
                  type="button"
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
                      className="w-full px-4 py-3 rounded-xl border-2 border-primary-100 focus:border-primary-300 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark/70 mb-1 block">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl border-2 border-primary-100 focus:border-primary-300 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark/70 mb-1 block">Phone (WhatsApp)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) setPhoneError('');
                      }}
                      placeholder="+1 415 555 0100"
                      className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                        phoneError ? 'border-red-300 focus:border-red-400' : 'border-primary-100 focus:border-primary-300'
                      }`}
                    />
                    {phoneError ? <p className="text-sm text-red-600 mt-1">{phoneError}</p> : null}
                    <p className="text-xs text-dark/45 mt-1">Include country code so we can send your WhatsApp confirmation.</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark/70 mb-1 block">Message (optional)</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share a word of encouragement for the children..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-primary-100 focus:border-primary-300 outline-none transition-colors resize-none"
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

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-6 py-4 rounded-xl glass text-tropical font-semibold hover:bg-white/80 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!name || !email) return;
                      if (!isValidPhoneForWhatsApp(phone)) {
                        setPhoneError('Enter a valid phone number with country code (e.g. +1 415 555 0100).');
                        return;
                      }
                      setPhoneError('');
                      setStep(3);
                    }}
                    disabled={!name || !email || !isValidPhoneForWhatsApp(phone)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl gradient-green text-white font-semibold shadow-lg shadow-primary-300/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <span className="font-bold text-tropical">
                      ${finalAmount} {type === 'monthly' ? '/month' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark/60">Category</span>
                    <span className="font-medium text-tropical">{categories.find((c) => c.id === category)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark/60">Donor</span>
                    <span className="font-medium text-tropical">{anonymous ? 'Anonymous' : name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark/60">Phone</span>
                    <span className="font-medium text-tropical">{phone}</span>
                  </div>
                  {message && (
                    <div className="pt-3 border-t border-primary-100">
                      <span className="text-dark/60 text-sm">Message:</span>
                      <p className="text-tropical italic mt-1">&quot;{message}&quot;</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-4 rounded-xl glass text-tropical font-semibold hover:bg-white/80 transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl gradient-green text-white font-semibold shadow-lg shadow-primary-300/30 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Heart className="w-5 h-5" />
                    {isSubmitting ? 'Processing…' : 'Complete Donation'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
