'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

interface BackToTopProps {
  targetId?: string;
  targetRef?: React.RefObject<HTMLElement | null>;
  threshold?: number;
  accent?: 'rose' | 'cyan';
}

export function BackToTop({
  targetId,
  targetRef,
  threshold = 250,
  accent = 'rose',
}: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const getScrollTarget = (): HTMLElement | null => {
      if (targetRef?.current) return targetRef.current;
      if (targetId && typeof document !== 'undefined') {
        return document.getElementById(targetId);
      }
      return null;
    };

    const scrollTarget = getScrollTarget();

    const checkScroll = () => {
      let currentScroll = 0;
      const target = getScrollTarget();

      if (target) {
        currentScroll = target.scrollTop;
      } else {
        currentScroll =
          window.scrollY ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;
      }

      setIsVisible(currentScroll > threshold);
    };

    if (scrollTarget) {
      scrollTarget.addEventListener('scroll', checkScroll, { passive: true });
    }
    window.addEventListener('scroll', checkScroll, { passive: true });

    // Initial check
    checkScroll();

    return () => {
      if (scrollTarget) {
        scrollTarget.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('scroll', checkScroll);
    };
  }, [targetId, targetRef, threshold]);

  const scrollToTop = () => {
    let scrollTarget: HTMLElement | null = null;
    if (targetRef?.current) {
      scrollTarget = targetRef.current;
    } else if (targetId && typeof document !== 'undefined') {
      scrollTarget = document.getElementById(targetId);
    }

    if (scrollTarget) {
      scrollTarget.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const accentClasses =
    accent === 'rose'
      ? 'border-rose-500/40 hover:border-rose-400 text-rose-300 hover:text-white shadow-[0_4px_24px_rgba(0,0,0,0.6),0_0_25px_rgba(244,63,94,0.35)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.7),0_0_35px_rgba(244,63,94,0.55)] focus:ring-rose-500/50'
      : 'border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white shadow-[0_4px_24px_rgba(0,0,0,0.6),0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.7),0_0_35px_rgba(6,182,212,0.55)] focus:ring-cyan-500/50';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          className={`group fixed bottom-20 md:bottom-8 right-6 md:right-8 z-40 flex items-center justify-center gap-2 p-3 sm:px-4 sm:py-2.5 rounded-full bg-dark-secondary/90 hover:bg-dark-secondary border ${accentClasses} backdrop-blur-xl transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2`}
        >
          <ArrowUp className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5" />
          <span className="text-xs font-semibold tracking-wider uppercase pr-0.5 select-none">
            Top
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
