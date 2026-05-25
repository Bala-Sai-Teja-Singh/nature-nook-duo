'use client';

import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';

/**
 * Lightweight scroll-reveal component using IntersectionObserver.
 * Zero dependencies. Adds a CSS class when the element enters the viewport.
 * 
 * Usage:
 *   <Reveal> ... </Reveal>
 *   <Reveal animation="fade-up" delay={0.2}> ... </Reveal>
 */

type Animation = 
  | 'fade-up' 
  | 'fade-down' 
  | 'fade-left' 
  | 'fade-right' 
  | 'fade-in' 
  | 'zoom-in' 
  | 'zoom-out'
  | 'blur-in'
  | 'slide-up'
  | 'flip-up';

interface RevealProps {
  children: ReactNode;
  animation?: Animation;
  delay?: number;       // seconds
  duration?: number;    // seconds
  threshold?: number;   // 0-1, how much element must be visible
  once?: boolean;       // only animate once (default: true)
  className?: string;
  style?: CSSProperties;
}

export function Reveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 0.6,
  threshold = 0.02,
  once = true,
  className = '',
  style,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('reveal-visible');
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove('reveal-visible');
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const combinedStyle: CSSProperties = {
    ...style,
    '--reveal-delay': `${delay}s`,
    '--reveal-duration': `${duration}s`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={`reveal reveal-${animation} ${className}`}
      style={combinedStyle}
    >
      {children}
    </div>
  );
}

/**
 * Container that applies staggered reveal animations to its children.
 * Each child gets an incrementally increasing delay.
 */
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number; // delay between each child in seconds
  animation?: Animation;
  className?: string;
  threshold?: number;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  animation = 'fade-up',
  className = '',
  threshold = 0.01,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          container.classList.add('stagger-visible');
          observer.unobserve(container);
        }
      },
      { threshold, rootMargin: '0px 0px -20px 0px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`stagger-container stagger-${animation} ${className}`}
      style={{ '--stagger-delay': `${staggerDelay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}
