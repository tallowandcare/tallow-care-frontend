import { useEffect } from 'react';

/**
 * Sets up IntersectionObserver for scroll-reveal animations.
 * Watches all elements with class 'sr' and adds 'visible' when they enter viewport.
 * Also handles section-title underline animation.
 */
export default function useScrollReveal() {
  useEffect(() => {
    const srObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            srObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.sr').forEach((el) => srObs.observe(el));

    // Section title underline reveal
    document.querySelectorAll('.section-title').forEach((el) => {
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            el.classList.add('visible');
            obs.disconnect();
          }
        },
        { threshold: 0.4 }
      );
      obs.observe(el);
    });

    return () => srObs.disconnect();
  }, []);
}
