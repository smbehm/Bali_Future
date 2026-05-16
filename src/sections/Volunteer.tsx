import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Calendar, Globe, Heart, Send, Loader2 } from 'lucide-react';
import FormSuccessScreen from '../components/FormSuccessScreen';
import { formatPostgrestError, isSupabaseConfigured, supabase, SUPABASE_CONFIG_ERROR } from '../lib/supabase';
import { devLog } from '../lib/devLog';
import { formatEmailWarning, linesToEmailHtml, sendEmailNotification } from '../lib/sendEmailNotification';

const journeySteps = [
  { icon: <Globe className="w-5 h-5" />, title: 'Share Your Heart', desc: 'Tell us what moves you to serve' },
  { icon: <Calendar className="w-5 h-5" />, title: 'Find Your Place', desc: 'We match your skills to real needs' },
  { icon: <MapPin className="w-5 h-5" />, title: 'Join the Family', desc: 'Arrive in Bali ready to make a difference' },
  { icon: <Heart className="w-5 h-5" />, title: 'Transform Lives', desc: 'Including your own' },
];

export default function Volunteer() {
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', country: '', skills: '', availability: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetSuccess = useCallback(() => {
    setSubmitted(false);
    setSubmitError(null);
    setSubmitWarning(null);
    setWhatsappMessage(null);
    setFormData({ full_name: '', email: '', phone: '', country: '', skills: '', availability: '', message: '' });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    setSubmitWarning(null);

    if (!isSupabaseConfigured()) {
      console.error('[volunteers] Supabase not configured at runtime');
      setSubmitError(SUPABASE_CONFIG_ERROR);
      return;
    }

    setIsSubmitting(true);
    devLog('[volunteers] insert', { email: formData.email.trim(), full_name: formData.full_name.trim() });

    const { error } = await supabase.from('volunteers').insert(formData);

    if (error) {
      console.error('[volunteers] Supabase insert failed', error);
      setSubmitError(formatPostgrestError(error));
      setIsSubmitting(false);
      return;
    }

    const displayName = formData.full_name.trim() || 'Applicant';
    const dash = '\u2014';
    const orgSubject = `New Volunteer Application ${dash} ${displayName}`;
    const orgHtml = linesToEmailHtml([
      `Name: ${displayName}`,
      `Email: ${formData.email.trim()}`,
      `Phone: ${formData.phone.trim() || dash}`,
      `Country: ${formData.country.trim() || dash}`,
      `Skills: ${formData.skills.trim() || dash}`,
      `Availability: ${formData.availability.trim() || dash}`,
      `Message: ${formData.message.trim() || dash}`,
    ]);

    const volunteerEmailTrim = formData.email.trim();
    const donorConfirmation =
      volunteerEmailTrim.includes('@')
        ? {
            to: volunteerEmailTrim,
            subject: `We've received your volunteer application ${dash} Bali Future`,
            html: linesToEmailHtml([
              'Thank you for offering your time and heart to the children we serve.',
              '',
              'Here is a copy of what you submitted:',
              `Name: ${displayName}`,
              `Email: ${volunteerEmailTrim}`,
              `Phone: ${formData.phone.trim() || dash}`,
              `Country: ${formData.country.trim() || dash}`,
              `Skills: ${formData.skills.trim() || dash}`,
              `Availability: ${formData.availability.trim() || dash}`,
              `Message: ${formData.message.trim() || dash}`,
            ]),
          }
        : null;

    const emailResult = await sendEmailNotification({
      organization: { subject: orgSubject, html: orgHtml },
      donor: donorConfirmation,
    });
    if (!emailResult.ok) {
      console.error('[volunteers] email notification failed', emailResult);
      setSubmitWarning(formatEmailWarning(emailResult));
    }

    setWhatsappMessage(
      `New volunteer application from ${formData.full_name.trim()} email: ${formData.email.trim()} country: ${formData.country.trim()}`,
    );
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section
      id="volunteer"
      className={`section-padding relative ${
        submitted
          ? 'overflow-x-clip bg-gradient-to-b from-cream/55 via-primary-50/15 to-cream/55'
          : 'overflow-hidden bg-gradient-to-b from-cream via-sky-50/30 to-cream'
      }`}
    >
      {!submitted && (
        <div className="decorative-blur absolute bottom-0 right-0 h-[min(500px,100vh)] w-[min(500px,100vw)] rounded-full bg-sky-50/50 blur-[80px]" />
      )}

      {submitted ? (
        <FormSuccessScreen
          title="Thank you! Your volunteer application was received"
          message="We appreciate your willingness to help children in Bali. Our team will review your application and get back to you soon."
          warning={submitWarning}
          whatsappMessage={whatsappMessage}
          accent="green"
          resetLabel="Submit Another Application"
          onReset={resetSuccess}
        />
      ) : (
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-16 max-w-3xl text-center"
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-600">
              <Users className="h-4 w-4" />
              Your Time Changes Everything
            </span>
            <h2 className="mb-6 font-sora text-3xl font-bold text-tropical md:text-5xl">
              Be the Reason a Child Smiles
            </h2>
            <p className="text-lg text-dark/60">
              Our volunteers don't just visit -- they become family. Whether you teach a child to read, build a
              classroom, or simply show up with love, your presence leaves a lasting mark on young hearts that will
              never forget you.
            </p>
          </motion.div>

          <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {journeySteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-sky text-white shadow-lg shadow-sky-200/50">
                  {step.icon}
                </div>
                <div className="font-sora text-sm font-bold text-tropical">{step.title}</div>
                <div className="mt-1 text-xs text-dark/50">{step.desc}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl"
          >
            <div className="relative">
              <form
                onSubmit={handleSubmit}
                className={`relative rounded-3xl bg-white p-8 shadow-xl shadow-sky-100/50 md:p-10 ${
                  isSubmitting ? 'pointer-events-none' : ''
                }`}
                aria-busy={isSubmitting}
              >
                <h3 className="mb-6 font-sora text-xl font-bold text-tropical">Volunteer Application</h3>
                {submitError ? (
                  <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {submitError}
                  </p>
                ) : null}
                <div className={`grid gap-4 md:grid-cols-2 ${isSubmitting ? 'opacity-55' : ''}`}>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-dark/70">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="form-field w-full rounded-xl border-2 border-sky-100 px-4 py-3 outline-none transition-colors focus:border-sky-300"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-dark/70">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-field w-full rounded-xl border-2 border-sky-100 px-4 py-3 outline-none transition-colors focus:border-sky-300"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-dark/70">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="form-field w-full rounded-xl border-2 border-sky-100 px-4 py-3 outline-none transition-colors focus:border-sky-300"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-dark/70">Availability</label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="form-field w-full rounded-xl border-2 border-sky-100 bg-white px-4 py-3 outline-none transition-colors focus:border-sky-300"
                    >
                      <option value="">Select duration</option>
                      <option value="1-2 weeks">1-2 weeks</option>
                      <option value="1 month">1 month</option>
                      <option value="3 months">3 months</option>
                      <option value="6+ months">6+ months</option>
                    </select>
                  </div>
                </div>
                <div className={`mt-4 ${isSubmitting ? 'opacity-55' : ''}`}>
                  <label className="mb-1 block text-sm font-medium text-dark/70">Skills & Experience</label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="Teaching, construction, medical, tech..."
                    className="form-field w-full rounded-xl border-2 border-sky-100 px-4 py-3 outline-none transition-colors focus:border-sky-300"
                  />
                </div>
                <div className={`mt-4 ${isSubmitting ? 'opacity-55' : ''}`}>
                  <label className="mb-1 block text-sm font-medium text-dark/70">Why do you want to volunteer?</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                    className="form-field w-full resize-none rounded-xl border-2 border-sky-100 px-4 py-3 outline-none transition-colors focus:border-sky-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl gradient-sky py-4 font-semibold text-white shadow-lg shadow-sky-200/50 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
                      Sending your application…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 shrink-0" aria-hidden />
                      Submit Application
                    </>
                  )}
                </button>
              </form>

              {isSubmitting ? (
                <div
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-3xl bg-cream/88 px-6 backdrop-blur-sm"
                  aria-live="polite"
                  aria-label="Submitting application"
                >
                  <Loader2 className="h-11 w-11 shrink-0 animate-spin text-sky-600" aria-hidden />
                  <p className="text-center text-sm font-semibold text-dark/75">Sending your application…</p>
                  <p className="max-w-xs text-center text-xs text-dark/50">Please wait a moment.</p>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
