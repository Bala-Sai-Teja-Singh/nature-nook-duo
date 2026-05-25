'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollFadeWrapperProps {
  children: React.ReactNode;
  className?: string;
  scrollClassName?: string;
}

export function ScrollFadeWrapper({
  children,
  className,
  scrollClassName,
}: ScrollFadeWrapperProps) {
  const [showLeftShade, setShowLeftShade] = React.useState(false);
  const [showRightShade, setShowRightShade] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      setShowLeftShade(el.scrollLeft > 10);
      setShowRightShade(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    }
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      checkScroll();
      
      const resizeObserver = new ResizeObserver(() => {
        checkScroll();
      });
      resizeObserver.observe(el);

      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      
      return () => {
        resizeObserver.disconnect();
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll]);

  return (
    <div className={cn("relative flex items-center justify-start w-full sm:w-fit overflow-hidden rounded-full", className)}>
      {/* Left Shade */}
      <AnimatePresence>
        {showLeftShade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 top-0 bottom-0 w-12 z-20 pointer-events-none bg-gradient-to-r from-background via-background/70 to-transparent rounded-l-full"
          />
        )}
      </AnimatePresence>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className={cn("overflow-x-auto no-scrollbar w-full", scrollClassName)}
      >
        {children}
      </div>

      {/* Right Shade */}
      <AnimatePresence>
        {showRightShade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 w-12 z-20 pointer-events-none bg-gradient-to-l from-background via-background/70 to-transparent rounded-r-full"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
