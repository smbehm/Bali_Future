import { type ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '../lib/whatsapp';

const WHATSAPP_AUTO_OPEN_MS = 2000;

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
  const [whatsappReady, setWhatsappReady] = useState(false);

  useEffect(() => {
    if (!whatsappMessage) {
      setWhatsappReady(false);
      return;
    }
    setWhatsappReady(false);
    const url = buildWhatsAppUrl(whatsappMessage);
    let cancelled = false;
    const t = window.setTimeout(() => {
      if (cancelled) return;
      window.open(url, '_blank', 'noopener,noreferrer');
      setWhatsappReady(true);
    }, WHATSAPP_AUTO_OPEN_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [whatsappMessage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mx-auto w-full max-w-lg px-3 py-6 sm:px-4 sm:py-8"
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-5 flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-lg sm:mb-6 sm:h-20 sm:w-20 ${styles.icon}`}
        >
          <Check className="h-8 w-8 text-white sm:h-9 sm:w-9" aria-hidden />
        </div>

        <h3 className="font-sora text-xl font-bold text-tropical sm:text-2xl md:text-3xl leading-snug">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-base leading-relaxed text-dark/60 px-1">{message}</p>

        {warning ? (
          <p className="mt-4 w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900">
            {warning}
          </p>
        ) : null}

        {whatsappHref ? (
          <div className="mt-6 w-full max-w-sm space-y-3">
            {!whatsappReady ? (
              <p className="text-sm text-dark/50" aria-live="polite">
                Opening WhatsApp in a moment…
              </p>
            ) : (
              <>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-opacity hover:opacity-95 min-h-[48px] ${styles.whatsapp}`}
                >
                  <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
                  Open WhatsApp
                </a>
                <p className="text-xs text-dark/45">
                  If WhatsApp did not open, tap the button above (some browsers block automatic pop-ups).
                </p>
              </>
            )}
          </div>
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
