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
      className="mx-auto w-full max-w-lg px-2 py-6 sm:px-4 sm:py-8"
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-5 flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-lg sm:mb-6 sm:h-20 sm:w-20 ${styles.icon}`}
        >
          <Check className="h-8 w-8 text-white sm:h-9 sm:w-9" aria-hidden />
        </div>

        <h3 className="font-sora text-2xl font-bold text-tropical sm:text-3xl">{title}</h3>
        <p className="mt-3 max-w-md text-base leading-relaxed text-dark/60">{message}</p>

        {warning ? (
          <p className="mt-4 w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900">
            {warning}
          </p>
        ) : null}

        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-6 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-opacity hover:opacity-95 sm:w-auto sm:min-w-[240px] ${styles.whatsapp}`}
          >
            <MessageCircle className="h-5 w-5 shrink-0" />
            Continue on WhatsApp
          </a>
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
      </div>
    </motion.div>
  );
}
