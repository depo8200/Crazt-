import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FastForward } from 'lucide-react';
import { IntroThreeBackground } from '../../three/IntroThreeBackground';
import { SemesterSelector } from '../common/SemesterSelector';
import { RealityCheckAnimation } from './RealityCheckAnimation';

interface IntroAnimationProps {
  initialSemester: number | null;
  reducedMotion: boolean;
  onSelectSemester: (semester: number) => void;
  onFinishIntro: () => void;
}

export function IntroAnimation({
  initialSemester,
  reducedMotion,
  onSelectSemester,
  onFinishIntro,
}: IntroAnimationProps) {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [stage1Beat, setStage1Beat] = useState<0 | 1 | 2 | 3>(0);
  const [chosenSem, setChosenSem] = useState<number | null>(initialSemester);

  // Stage 1: ~4 seconds total with staggered kinetic typography, then auto-advance to Stage 2
  useEffect(() => {
    if (stage !== 1) return;

    const scale = reducedMotion ? 0.45 : 1;
    const t1 = window.setTimeout(() => setStage1Beat(1), Math.round(700 * scale));
    const t2 = window.setTimeout(() => setStage1Beat(2), Math.round(1650 * scale));
    const t3 = window.setTimeout(() => setStage1Beat(3), Math.round(2550 * scale));
    const tNext = window.setTimeout(() => setStage(2), Math.round(4100 * scale));

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tNext);
    };
  }, [stage, reducedMotion]);

  const handlePickSemester = (semester: number) => {
    setChosenSem(semester);
    onSelectSemester(semester);
    // Advance swiftly on interaction — never force user to wait
    window.setTimeout(() => {
      setStage(3);
    }, reducedMotion ? 100 : 360);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#05070D] text-[#F8FAFC]">
      {/* Full-screen Three.js 3D spatial backdrop */}
      <IntroThreeBackground stage={stage} reducedMotion={reducedMotion} />

      {/* Subtle readability vignette scrim over 3D background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#05070D]/60 via-[#05070D]/35 to-[#05070D]/80"
      />

      {/* Persistent Top Control Bar: Stage indicator + Skip Intro */}
      <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <div className="webgl-hud-surface inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-[#CBD5E1]">
          <span className="font-display font-bold text-[#F8FAFC]">CRAZY!</span>
          <span className="text-[#64748B]" aria-hidden="true">
            ·
          </span>
          <span className="font-mono tabular-nums text-[#60A5FA]">
            0{stage} / 03
          </span>
        </div>

        <button
          type="button"
          onClick={onFinishIntro}
          className="webgl-hud-surface inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-[#F8FAFC] transition-colors hover:border-[#60A5FA]/70 hover:bg-[#13213D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] whitespace-nowrap"
        >
          Skip Intro
          <FastForward className="h-3.5 w-3.5 text-[#60A5FA]" />
        </button>
      </div>

      {/* Stage Content Container */}
      <div className="relative z-10 min-h-screen w-full">
        <AnimatePresence mode="wait">
          {stage === 1 && (
            <motion.section
              key="stage-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
              transition={{ duration: reducedMotion ? 0.15 : 0.45 }}
              className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
            >
              {/* Expanding central electric-blue focal flare */}
              <motion.div
                initial={reducedMotion ? false : { scale: 0.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8 flex items-center justify-center"
              >
                <div className="h-14 w-14 rounded-2xl border border-[#60A5FA]/50 bg-[#2563EB]/20 p-3 shadow-[0_0_48px_rgba(37,99,235,0.65)]">
                  <div className="h-full w-full rounded-lg bg-[#3B82F6]" />
                </div>
              </motion.div>

              {/* CRAZY! wordmark blur-to-sharp reveal */}
              <motion.h1
                initial={
                  reducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.84, filter: 'blur(16px)' }
                }
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: reducedMotion ? 0.2 : 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-6xl font-extrabold tracking-tight text-[#F8FAFC] sm:text-8xl"
              >
                CRAZY<span className="text-[#3B82F6]">!</span>
              </motion.h1>

              {/* Staggered kinetic lines */}
              <div className="mt-8 flex min-h-[116px] flex-col items-center justify-start gap-2.5">
                {stage1Beat >= 1 && (
                  <motion.p
                    initial={
                      reducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 18, filter: 'blur(8px)' }
                    }
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl"
                  >
                    TIME TO STUDY.
                  </motion.p>
                )}

                {stage1Beat >= 2 && (
                  <motion.p
                    initial={
                      reducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 18, filter: 'blur(8px)' }
                    }
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display text-2xl font-bold tracking-tight text-[#60A5FA] sm:text-4xl"
                  >
                    BUT WITH A STRATEGY.
                  </motion.p>
                )}

                {stage1Beat >= 3 && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.38 }}
                    className="mt-2 text-sm font-medium text-[#CBD5E1] sm:text-base"
                  >
                    Your academic comeback starts here.
                  </motion.p>
                )}
              </div>
            </motion.section>
          )}

          {stage === 2 && (
            <motion.section
              key="stage-2"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: reducedMotion ? 0.15 : 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-5 py-24"
            >
              <p className="font-display text-lg font-bold text-[#60A5FA] sm:text-2xl">
                HEY DUDE! 👀
              </p>
              <h2 className="mt-2 text-center font-display text-3xl font-extrabold tracking-tight text-[#F8FAFC] sm:text-5xl">
                WHAT SEMESTER ARE YOU IN?
              </h2>

              <div className="mt-8 w-full">
                <SemesterSelector
                  selectedSemester={chosenSem}
                  onSelect={handlePickSemester}
                  reducedMotion={reducedMotion}
                  overWebGL
                />
              </div>

              <p className="mt-7 text-center text-sm text-[#94A3B8]">
                Be honest. We won&apos;t judge. Much. 💀
              </p>

              <div className="mt-6 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStage(3)}
                  className="text-xs font-medium text-[#94A3B8] underline underline-offset-4 transition-colors hover:text-[#F8FAFC]"
                >
                  Skip semester selection
                </button>
              </div>
            </motion.section>
          )}

          {stage === 3 && (
            <motion.section
              key="stage-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.15 : 0.35 }}
              className="w-full"
            >
              <RealityCheckAnimation
                selectedSemester={chosenSem}
                reducedMotion={reducedMotion}
                onComplete={onFinishIntro}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
