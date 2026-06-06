import { useEffect, useRef, useState } from 'react';

/**
 * Animated counter hook. Returns current display value.
 * @param {number} target – Final number
 * @param {string} suffix – Suffix string e.g. '+', '%'
 * @param {boolean} startCounting – Whether to begin animation
 */
export default function useCountUp(target, suffix = '', startCounting = false) {
  const [display, setDisplay] = useState('0' + suffix);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!startCounting) return;

    let current = 0;
    const step = target / 65;

    const tick = () => {
      current = Math.min(current + step, target);
      const formatted = target >= 1000
        ? Math.round(current).toLocaleString()
        : String(Math.round(current));
      setDisplay(formatted + suffix);
      if (current < target) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, suffix, startCounting]);

  return display;
}
