import { useEffect, useRef } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

const features = [
  { emoji: '🌿', title: '100% Natural', desc: 'Crafted from ethically sourced, grass-fed tallow with zero artificial additives or harsh preservatives for the purest experience.', color: 'ic-green' },
  { emoji: '💧', title: 'Deep Hydration', desc: "Tallow's unique fatty acid profile mirrors your pet's natural skin oils, providing unparalleled moisture and lasting hydration.", color: 'ic-yellow' },
  { emoji: '🌸', title: 'Allergy Relief', desc: 'Gentle, anti-inflammatory properties calm irritation, reduce redness, and soothe even the most sensitive, allergy-prone coats.', color: 'ic-coral' },
  { emoji: '❤️', title: 'Skin Healing', desc: 'Rich in vitamins A, D, E, and K, tallow actively supports skin regeneration, accelerating recovery from dryness and irritation.', color: 'ic-coral' },
  { emoji: '🧬', title: 'Bio-compatible', desc: "Tallow is naturally bio-compatible with mammalian skin biology — meaning your pet's body recognises and absorbs it effortlessly.", color: 'ic-green' },
  { emoji: '♻️', title: 'Sustainable', desc: 'Ethically produced from grass-fed, pasture-raised sources using zero-waste principles and planet-friendly farming methods.', color: 'ic-yellow' },
];

function StatItem({ target, suffix, label }) {
  const ref = useRef(null);
  const countedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !countedRef.current) {
          countedRef.current = true;
          let v = 0;
          const step = target / 65;
          const numEl = el.querySelector('.stat-num');
          const tick = () => {
            v = Math.min(v + step, target);
            const display = target >= 1000
              ? Math.round(v).toLocaleString()
              : String(Math.round(v));
            numEl.textContent = display + suffix;
            if (v < target) requestAnimationFrame(tick);
          };
          tick();
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, suffix]);

  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-num">0</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function WhyTallow() {
  useScrollReveal();

  return (
    <>
      <section id="why-tallow" className="why-bg section-padding page-top">
        <span className="section-tag sr">Achieve Nature's Nature</span>
        <h2 className="section-title sr sr-delay-1">Why Tallow?</h2>
        <p className="section-sub sr sr-delay-2">
          Discover why tallow is the ultimate natural remedy for your pet's skin
          health and well-being.
        </p>
        <div className="features-grid">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`feature-card sr sr-delay-${i + 1}`}
              onClick={(e) => {
                if (window.innerWidth <= 900) {
                  e.currentTarget.classList.toggle('is-flipped');
                  e.currentTarget.querySelector('.card-inner').classList.add('was-flipped');
                }
              }}
              onMouseMove={(e) => {
                if (window.innerWidth <= 900) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) / (rect.width / 2);
                const dy = (e.clientY - cy) / (rect.height / 2);
                e.currentTarget.style.transform = `translateY(-8px) perspective(600px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg) scale(1.01)`;
              }}
              onMouseLeave={(e) => {
                if (window.innerWidth <= 900) return;
                e.currentTarget.style.transform = '';
              }}
            >
              <div className="card-inner">
                <div className="face front">
                  <div className={`feature-icon ${f.color}`}>{f.emoji}</div>
                  <h3>{f.title}</h3>
                  <p className="front-desc">{f.desc}</p>
                  <div className="tap-hint">
                    <span>Tap to read</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
                  </div>
                </div>
                <div className="face back">
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <div className="stats-row sr zoom">
        <StatItem target={12000} suffix="+" label="Happy Pet Families" />
        <StatItem target={98} suffix="%" label="Would Recommend" />
        <StatItem target={6} suffix="" label="Premium Product Lines" />
        <StatItem target={100} suffix="%" label="Natural Ingredients" />
      </div>
    </>
  );
}
