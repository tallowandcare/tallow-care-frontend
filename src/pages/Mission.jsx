import useScrollReveal from '../hooks/useScrollReveal';

const missions = [
  { emoji: '🐾', title: 'Pet-First Philosophy', desc: "Every product starts and ends with your pet. We formulate with their comfort, safety, and joy as the only metric that matters.", color: 'ic-green' },
  { emoji: '🔬', title: 'Science-Backed', desc: 'Our formulas are developed alongside veterinary dermatologists and nutritionists to ensure maximum efficacy and safety.', color: 'ic-yellow' },
  { emoji: '🌍', title: 'Sustainability', desc: 'From ethical sourcing to biodegradable packaging, we take responsibility for our environmental footprint at every step.', color: 'ic-coral' },
  { emoji: '🔍', title: 'Transparency', desc: 'Every ingredient is listed, sourced with care, and explained. No secrets, no fillers, no hidden chemicals — ever.', color: 'ic-green' },
  { emoji: '🤝', title: 'Community Driven', desc: "Built by pet parents, for pet parents. We listen to our community and constantly evolve based on real feedback and experiences.", color: 'ic-yellow' },
  { emoji: '⭐', title: 'Quality Guarantee', desc: "Every batch is third-party tested for purity and potency. If your pet isn't happy, neither are we — 100% satisfaction guaranteed.", color: 'ic-coral' },
];

export default function Mission() {
  useScrollReveal();

  return (
    <>
      <section id="mission" className="mission-bg section-padding page-top">
        <span className="section-tag sr">Our Purpose</span>
        <h2 className="section-title sr sr-delay-1">Our Mission</h2>
        <p className="section-sub sr sr-delay-2">
          We're committed to revolutionising pet care through naturally effective
          and sustainable solutions.
        </p>
        <div className="mission-grid">
          {missions.map((m, i) => (
            <div 
              key={m.title} 
              className={`mission-item sr sr-delay-${i + 1}`}
              onClick={(e) => {
                if (window.innerWidth <= 900) {
                  e.currentTarget.classList.toggle('is-flipped');
                  e.currentTarget.querySelector('.card-inner').classList.add('was-flipped');
                }
              }}
            >
              <div className="card-inner">
                <div className="face front">
                  <div className={`mission-icon ${m.color}`}>{m.emoji}</div>
                  <h3>{m.title}</h3>
                  <p className="front-desc">{m.desc}</p>
                  <div className="tap-hint">
                    <span>Tap to read</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
                  </div>
                </div>
                <div className="face back">
                  <div>
                    <h3>{m.title}</h3>
                    <p>{m.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* JOIN CTA */}
      <div className="join-strip sr zoom">
        <div>
          <h2>Join Our Mission</h2>
          <p>
            Together, we can create healthier, happier pets through the power of
            nature. Join thousands of pet parents who've already made the switch.
          </p>
        </div>
        <div className="join-btns">
          <a href="#mission" className="btn-white">
            Learn More About Us
          </a>
          <a href="#products" className="btn-yellow">
            Start Shopping
          </a>
        </div>
      </div>
    </>
  );
}
