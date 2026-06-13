import { useEffect, useRef } from 'react';
import ParticleCanvas from '../components/ParticleCanvas';
import Marquee from '../components/Marquee';
import useScrollReveal from '../hooks/useScrollReveal';

function HeroVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.muted = true;

    const tryPlay = () => {
      vid.play().catch(() => {});
    };

    // Try immediately
    tryPlay();

    // Also try on canplay in case not ready yet
    vid.addEventListener('canplay', tryPlay, { once: true });
    return () => vid.removeEventListener('canplay', tryPlay);
  }, []);

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
    >
      <source src="/final_Tallow_Care_video.mp4" type="video/mp4" />
    </video>
  );
}

export default function Home() {
  useScrollReveal();

  return (
    <>
      {/* HERO */}
      <section id="home" className="hero-section">
        <ParticleCanvas />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />

        <div className="hero-text">
          <div className="hero-label">Natural Pet Care</div>
          <h1 className="hero-title">
            Healing skin,<br />
            <em>naturally.</em>
          </h1>
          <p className="hero-desc">
            We know how to treat them right. Skip the harsh chemicals and hello
            to soothing, natural tallow soap designed specifically for your
            pet's sensitive skin.
          </p>
          <div className="hero-ctas">
            <a href="#products" className="btn-primary">
              🛒 Shop Collection
            </a>
            <span className="badge"></span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="dog-circle">
            <HeroVideo />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee />
    </>
  );
}
