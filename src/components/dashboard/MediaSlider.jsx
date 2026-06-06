import { useState, useEffect, useRef, useCallback } from 'react';

const SLIDER_MEDIA = [
  { id: 1, src: '/slider/1.png',  type: 'image' },
  { id: 2, src: '/slider/2.mp4',  type: 'video' },
  { id: 3, src: '/slider/3.mp4',  type: 'video' },
  { id: 4, src: '/slider/4.mp4',  type: 'video' },
  { id: 5, src: '/slider/5.png',  type: 'image' },
  { id: 6, src: '/slider/6.mp4',  type: 'video' },
];

const IMAGE_DURATION = 6500;
const FADE_DURATION  = 550;

export default function MediaSlider() {
  const [visibleIndex,    setVisibleIndex]    = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const videoRef   = useRef(null);
  const timerRef   = useRef(null);
  const mountedRef = useRef(true);

  const goToNext = useCallback(() => {
    if (!mountedRef.current) return;
    clearTimeout(timerRef.current);
    setIsTransitioning(true);
    timerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setVisibleIndex(prev => (prev + 1) % SLIDER_MEDIA.length);
      setIsTransitioning(false);
    }, FADE_DURATION);
  }, []);

  // Image timer
  useEffect(() => {
    const item = SLIDER_MEDIA[visibleIndex];
    if (item.type === 'image') {
      timerRef.current = setTimeout(goToNext, IMAGE_DURATION);
    }
    return () => clearTimeout(timerRef.current);
  }, [visibleIndex, goToNext]);

  // Video autoplay — robust cross-browser approach
  useEffect(() => {
    const item = SLIDER_MEDIA[visibleIndex];
    if (item.type !== 'video') return;

    const vid = videoRef.current;
    if (!vid) return;

    // Reset to start cleanly
    vid.pause();
    vid.currentTime = 0;
    vid.muted = true;         // must be muted for autoplay policy
    vid.load();

    // Use canplay event to trigger play — more reliable than immediate .play()
    const tryPlay = () => {
      vid.play().catch(() => {
        // Autoplay blocked — advance after fallback delay
        timerRef.current = setTimeout(goToNext, 3000);
      });
    };

    vid.addEventListener('canplay', tryPlay, { once: true });
    return () => {
      vid.removeEventListener('canplay', tryPlay);
      vid.pause();
    };
  }, [visibleIndex, goToNext]);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(timerRef.current);
    };
  }, []);

  const item = SLIDER_MEDIA[visibleIndex];

  return (
    <div className="ms-slider">
      <div className={`ms-media${isTransitioning ? ' ms-media--fade-out' : ' ms-media--fade-in'}`}>
        {item.type === 'image' ? (
          <img
            key={item.src}
            src={item.src}
            alt={`Slide ${visibleIndex + 1}`}
            className="ms-img"
            draggable={false}
          />
        ) : (
          <video
            key={item.src}
            ref={videoRef}
            className="ms-vid"
            muted
            playsInline
            autoPlay
            preload="auto"
            loop={false}
            onEnded={goToNext}
            // fallback: if video stalls, skip after 15s
            onError={goToNext}
          >
            <source src={item.src} type="video/mp4" />
          </video>
        )}
      </div>

      <div className="ms-overlay" aria-hidden="true" />

      <div className="ms-dots" aria-hidden="true">
        {SLIDER_MEDIA.map((s, i) => (
          <span
            key={s.id}
            className={`ms-dot${i === visibleIndex ? ' ms-dot--active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
