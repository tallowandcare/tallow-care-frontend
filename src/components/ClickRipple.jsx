import { useEffect } from 'react';

/**
 * Global click ripple effect.
 * Spawns an expanding circle at the click position that fades out.
 */
export default function ClickRipple() {
  useEffect(() => {
    const handleClick = (e) => {
      const ripple = document.createElement('div');
      ripple.className = 'ripple';
      ripple.style.cssText = `left:${e.clientX - 20}px;top:${e.clientY - 20}px;width:40px;height:40px;`;
      document.body.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
