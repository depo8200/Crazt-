import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '../../data/demoPapers';

interface MotivationBannerProps {
  reducedMotion: boolean;
}

export function MotivationBanner({ reducedMotion }: MotivationBannerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  const current = MOTIVATIONAL_QUOTES[index];

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#3B82F6]/22 bg-[#090F1C] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] text-[#60A5FA]">
          Comeback Reminder {index + 1}/{MOTIVATIONAL_QUOTES.length}
        </p>
        <div className="mt-1 min-h-[44px] sm:min-h-[28px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0.1 : 0.25 }}
            >
              <p className="font-display text-base font-bold text-[#F8FAFC]">
                &ldquo;{current.quote}&rdquo;
              </p>
              <p className="mt-0.5 text-xs text-[#94A3B8]">{current.subtext}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)}
        className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-[#3B82F6]/25 bg-[#0D1525] px-3.5 py-2 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-[#3B82F6]/60 hover:text-white sm:self-center whitespace-nowrap"
      >
        <RefreshCw className="h-3.5 w-3.5 text-[#60A5FA]" />
        Next Quote
      </button>
    </div>
  );
}
