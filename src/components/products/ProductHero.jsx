import { useEffect, useRef } from 'react';

export default function ProductHero({ onShopNow }) {
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const handleMouse = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty('--mx', `${x}%`);
      hero.style.setProperty('--my', `${y}%`);
    };
    hero.addEventListener('mousemove', handleMouse);
    return () => hero.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <section className="prod-hero" ref={heroRef}>
      {/* Animated orbs */}
      <div className="prod-hero-orb prod-hero-orb--1" />
      <div className="prod-hero-orb prod-hero-orb--2" />
      <div className="prod-hero-orb prod-hero-orb--3" />

      {/* Background image layer */}
      <div className="prod-hero-bg">
        <img
          src="/products/prod1/_81BD2ED6-B12D-4CCD-B5FB-790CB9F2ABD0_-removebg-preview.png"
          alt="Cat care product"
          className="prod-hero-product-img prod-hero-product-img--main"
        />
        <img
          src="/products/prod2/_63AB8781-E897-40A6-9A76-7296AF0A7EE9_-removebg-preview.png"
          alt="Cat care product"
          className="prod-hero-product-img prod-hero-product-img--secondary"
        />
      </div>

      <div className="prod-hero-content">
        {/* Badge */}
        <div className="prod-hero-badge">
          <span className="prod-hero-badge-dot" />
          Premium Cat Care
        </div>

        <h1 className="prod-hero-title">
          Nature's Best,<br />
          <span className="prod-hero-title-accent">For Your Cat.</span>
        </h1>

        <p className="prod-hero-sub">
          Vet-approved tallow-based skincare formulated for sensitive feline skin.
          100% natural ingredients, zero compromise.
        </p>

        <div className="prod-hero-stats">
          <div className="prod-hero-stat">
            <span className="prod-hero-stat-num">4,200+</span>
            <span className="prod-hero-stat-label">Happy Cats</span>
          </div>
          <div className="prod-hero-stat-div" />
          <div className="prod-hero-stat">
            <span className="prod-hero-stat-num">100%</span>
            <span className="prod-hero-stat-label">Natural</span>
          </div>
          <div className="prod-hero-stat-div" />
          <div className="prod-hero-stat">
            <span className="prod-hero-stat-num">Vet</span>
            <span className="prod-hero-stat-label">Approved</span>
          </div>
        </div>

        <div className="prod-hero-ctas">
          <button className="prod-hero-cta-primary" onClick={onShopNow}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Shop Now
          </button>
          <a href="#why-choose-us" className="prod-hero-cta-secondary">
            Learn More
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Trust badges */}
      <div className="prod-hero-trust">
        <div className="prod-hero-trust-item">🌿 Organic</div>
        <div className="prod-hero-trust-item">🔬 Science-backed</div>
        <div className="prod-hero-trust-item">🐾 Cat-safe</div>
        <div className="prod-hero-trust-item">🚚 Fast Delivery</div>
      </div>
    </section>
  );
}
