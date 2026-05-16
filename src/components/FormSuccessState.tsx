import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '../lib/whatsapp';

type FormSuccessStateProps = {
  title: string;
  message: ReactNode;
  warning?: string | null;
  whatsappMessage?: string | null;
  accent?: 'green' | 'sky';
  resetLabel?: string;
  onReset?: () => void;
};

const accentClasses = {
  green: {
    icon: 'gradient-green shadow-primary-300/30',
    whatsapp: 'gradient-green shadow-primary-300/30',
  },
  sky: {
    icon: 'gradient-sky shadow-sky-200/50',
    whatsapp: 'gradient-sky shadow-sky-200/50',
  },
} as const;

export default function FormSuccessState({
  title,
  message,
  warning,
  whatsappMessage,
  accent = 'green',
  resetLabel = 'Submit again',
  onReset,
}: FormSuccessStateProps) {
  const styles = accentClasses[accent];
  const whatsappHref = whatsappMessage ? buildWhatsAppUrl(whatsappMessage) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mx-auto w-full max-w-lg px-3 py-6 sm:px-4 sm:py-8"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.25 }}
        className="flex flex-col items-center text-center"
      >
        <div
          className={`mb-5 flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-lg sm:mb-6 sm:h-20 sm:w-20 ${styles.icon}`}
        >
          <Check className="h-8 w-8 text-white sm:h-9 sm:w-9" aria-hidden />
        </div>

        <h3 className="font-sora text-xl font-bold leading-snug text-tropical sm:text-2xl md:text-3xl">
          {title}
        </h3>
        <p className="mt-3 max-w-md px-1 text-base leading-relaxed text-dark/60">{message}</p>

        {warning ? (
          <p className="mt-4 w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900">
            {warning}
          </p>
        ) : null}

        {whatsappHref ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="mt-6 w-full max-w-sm"
          >
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-opacity hover:opacity-95 ${styles.whatsapp}`}
            >
              <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
              Open WhatsApp
            </a>
            <p className="mt-2 text-xs text-dark/45">
              Optional — tap to continue the conversation on WhatsApp.
            </p>
          </motion.div>
        ) : null}

        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="mt-4 px-6 py-2.5 text-sm font-semibold text-tropical/70 transition-colors hover:text-tropical"
          >
            {resetLabel}
          </button>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
