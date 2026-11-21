import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface RealityCheckAnimationProps {
  selectedSemester: number | null;
  reducedMotion: boolean;
  onComplete: () => void;
}

interface KineticSlide {
  text: string;
  accentWord?: string;
  durationMs: number;
  enterFrom: { x: number; y: number; rotate: number };
  underline?: boolean;
  finale?: boolean;
}

const SLIDES: KineticSlide[] = [
  {
    text: "YOU'RE JUST REELING. 📱",
    durationMs: 1450,
    enterFrom: { x: -60, y: 12, rotate: -3 },
  },
  {
    text: 'PLAYING GAMES. 🎮',
    durationMs: 1450,
    enterFrom: { x: 60, y: -12, rotate: 3 },
  },
  {
    text: 'SCROLLING ALL DAY? 💀',
    durationMs: 1500,
    enterFrom: { x: 0, y: 48, rotate: -2 },
  },
  {
    text: 'AND THE SEMESTER IS ENDING...',
    durationMs: 1650,
    enterFrom: { x: 0, y: -40, rotate: 0 },
  },
  {
    text: "NOW IT'S TIME TO STUDY.",
    durationMs: 1700,
    enterFrom: { x: -45, y: 20, rotate: 0 },
    underline: true,
  },
  {
    text: 'YOUR COMEBACK ARC STARTS NOW.',
    durationMs: 1950,
    enterFrom: { x: 0, y: 30, rotate: 0 },
    underline: true,
    finale: true,
  },
];

export function RealityCheckAnimation({
  selectedSemester,
  reducedMotion,
  onComplete,
}: RealityCheckAnimationProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    const current = SLIDES[slideIndex];
    const duration = reducedMotion ? 900 : current.durationMs;

    const timer = window.setTimeout(() => {
      if (slideIndex < SLIDES.length - 1) {
        setSlideIndex((prev) => prev + 1);
      } else {
        setLaunching(true);
        window.setTimeout(() => {
          onComplete();
        }, reducedMotion ? 180 : 520);
      }
    }, duration);

    return () => window.clearTimeout(timer);
  }, [slideIndex, reducedMotion, onComplete]);

  const current = SLIDES[slideIndex];
  const progressPct = ((slideIndex + 1) / SLIDES.length) * 100;

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
      {/* Electric blue transition surge at the end */}
      <AnimatePresence>
        {launching && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1.25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed inset-0 z-30 bg-[#2563EB]/90"
          />
        )}
      </AnimatePresence>

      {/* Abstract geometric vector frame lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  rotate: slideIndex * 30,
                  scale: current.finale ? 1.18 : 1,
                }
          }
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="h-[340px] w-[340px] rounded-[42px] border border-[#3B82F6]/25 sm:h-[460px] sm:w-[460px]"
        />
      </div>

      <div className="relative z-10 flex max-w-4xl flex-col items-center">
        {selectedSemester && (
          <p className="mb-5 font-mono text-xs tracking-wider text-[#60A5FA]">
            SEMESTER {selectedSemester} REALITY CHECK
          </p>
        )}

        <div className="flex min-h-[160px] items-center justify-center sm:min-h-[210px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={slideIndex}
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: current.enterFrom.x,
                      y: current.enterFrom.y,
                      rotate: current.enterFrom.rotate,
                      scale: 0.9,
                      filter: 'blur(12px)',
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                rotate: 0,
                scale: 1,
                filter: 'blur(0px)',
              }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      y: -26,
                      scale: 1.06,
                      filter: 'blur(10px)',
                    }
              }
              transition={{
                duration: reducedMotion ? 0.2 : 0.44,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col items-center"
            >
              <h2
                className={`font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl ${
                  current.finale ? 'text-[#60A5FA]' : 'text-[#F8FAFC]'
                }`}
              >
                {current.text}
              </h2>

              {current.underline && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.55, delay: 0.14 }}
                  className="mt-5 h-1 w-44 origin-left rounded-full bg-[#3B82F6] sm:w-72"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Clean thin progress line */}
        <div className="mt-10 h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#3B82F6] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <button
          type="button"
          onClick={onComplete}
          className="webgl-hud-surface mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-[#F8FAFC] transition-colors hover:border-[#60A5FA]/70 hover:bg-[#13213D] whitespace-nowrap"
        >
          Enter Dashboard Now
          <ArrowRight className="h-3.5 w-3.5 text-[#60A5FA]" />
        </button>
      </div>
    </div>
  );
}
