import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Calendar, Globe, Heart, Send, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { notifyVolunteerRecorded } from '../lib/sendEmailNotification';
import { isValidPhoneForWhatsApp } from '../lib/phone';
import {
  buildVolunteerWhatsAppUrls,
  openWhatsAppChatsFromUserGesture,
  volunteerApplicantConfirmationMessage,
  volunteerOrgWhatsAppMessage,
} from '../lib/whatsapp';

const journeySteps = [
  { icon: <Globe className="w-5 h-5" />, title: 'Share Your Heart', desc: 'Tell us what moves you to serve' },
  { icon: <Calendar className="w-5 h-5" />, title: 'Find Your Place', desc: 'We match your skills to real needs' },
  { icon: <MapPin className="w-5 h-5" />, title: 'Join the Family', desc: 'Arrive in Bali ready to make a difference' },
  { icon: <Heart className="w-5 h-5" />, title: 'Transform Lives', desc: 'Including your own' },
];

const SUCCESS_VISIBLE_MS = 3000;

const emptyForm = {
  full_name: '',
  email: '',
  phone: '',
  country: '',
  skills: '',
  availability: '',
  message: '',
};

export default function Volunteer() {
  const [formData, setFormData] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const successTimeoutRef = useRef<number | null>(null);

  const resetForm = useCallback(() => {
    setFormData({ ...emptyForm });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isValidPhoneForWhatsApp(formData.phone)) {
      setPhoneError('Enter a valid phone number with country code (e.g. +1 415 555 0100).');
      return;
    }
    setPhoneError('');

    setIsSubmitting(true);

    const timestamp = new Date().toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    try {
      const { error } = await supabase.from('volunteers').insert(formData);
      if (error) {
        console.error(error);
        return;
      }

      void notifyVolunteerRecorded({
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        country: formData.country,
        skills: formData.skills,
        availability: formData.availability,
        message: formData.message,
      });

      const orgMessage = volunteerOrgWhatsAppMessage({
        fullName: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        availability: formData.availability,
        skills: formData.skills,
        message: formData.message,
        timestamp,
      });

      const applicantConfirmation = volunteerApplicantConfirmationMessage(formData.full_name);
      const waUrls = buildVolunteerWhatsAppUrls({
        applicantPhoneRaw: formData.phone,
        orgMessage,
        applicantConfirmationMessage: applicantConfirmation,
      });
      openWhatsAppChatsFromUserGesture(waUrls);

      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="volunteer" className="section-padding relative overflow-hidden bg-gradient-to-b from-cream via-sky-50/30 to-cream">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-sky-50/50 blur-[80px]" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-sm font-semibold mb-4">
            <Users className="w-4 h-4" />
            Your Time Changes Everything
          </span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl text-tropical mb-6">
            Be the Reason a Child Smiles
          </h2>
          <p className="text-dark/60 text-lg">
            Our volunteers don't just visit -- they become family. Whether you teach a child to read,
            build a classroom, or simply show up with love, your presence leaves a lasting mark
            on young hearts that will never forget you.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {journeySteps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl gradient-sky flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-sky-200/50">
                {step.icon}
              </div>
              <div className="font-sora font-bold text-tropical text-sm">{step.title}</div>
              <div className="text-xs text-dark/50 mt-1">{step.desc}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full gradient-sky flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-sora font-bold text-2xl text-tropical mb-3">Welcome to the Family</h3>
              <p className="text-dark/60">
                Your application is in our hands. We will be in touch within 48 hours to start your journey together.
              </p>
              <button
                type="button"
                onClick={dismissSuccess}
                className="mt-8 px-8 py-3 rounded-full glass text-tropical font-semibold hover:bg-white/80 transition-colors"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-sky-100/50 p-8 md:p-10">
              <h3 className="font-sora font-bold text-xl text-tropical mb-6">Volunteer Application</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-dark/70 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-sky-100 focus:border-sky-300 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark/70 mb-1 block">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-sky-100 focus:border-sky-300 outline-none transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-dark/70 mb-1 block">Phone (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (phoneError) setPhoneError('');
                    }}
                    placeholder="+1 415 555 0100"
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
                      phoneError ? 'border-red-300 focus:border-red-400' : 'border-sky-100 focus:border-sky-300'
                    }`}
                  />
                  {phoneError ? <p className="text-sm text-red-600 mt-1">{phoneError}</p> : null}
                  <p className="text-xs text-dark/45 mt-1">Include country code for your WhatsApp confirmation.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-dark/70 mb-1 block">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-sky-100 focus:border-sky-300 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark/70 mb-1 block">Availability</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-sky-100 focus:border-sky-300 outline-none transition-colors bg-white"
                  >
                    <option value="">Select duration</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                    <option value="1 month">1 month</option>
                    <option value="3 months">3 months</option>
                    <option value="6+ months">6+ months</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-dark/70 mb-1 block">Skills & Experience</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Teaching, construction, medical, tech..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-sky-100 focus:border-sky-300 outline-none transition-colors"
                />
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-dark/70 mb-1 block">Why do you want to volunteer?</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-sky-100 focus:border-sky-300 outline-none transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl gradient-sky text-white font-semibold shadow-lg shadow-sky-200/50 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting…' : 'Submit Application'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
