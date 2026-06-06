import { useState } from 'react';

const GOALS = [
  {
    icon: '🐾',
    text: 'Pet-First Philosophy',
    sub: "Everything we make puts your pet's needs first — from ingredient sourcing to final formulation.",
  },
  {
    icon: '🔬',
    text: 'Science-Backed',
    sub: 'Every product is formulated with evidence-based research and dermatologically tested ingredients.',
  },
  {
    icon: '🌍',
    text: 'Sustainability',
    sub: 'Eco-friendly, recyclable packaging — because a healthy planet means healthier pets.',
  },
  {
    icon: '🔍',
    text: 'Transparency',
    sub: 'Every ingredient is listed clearly — no hidden additives, no greenwashing, ever.',
  },
];

export default function MissionSection() {
  const [flipped, setFlipped] = useState(null);

  const handleFlip = (i) => {
    // Toggle: click same card → close it; click new card → open it, close previous
    setFlipped(prev => (prev === i ? null : i));
  };

  return (
    <section className="dash-section">
      <div className="dash-mission-card-full">
        <div className="dash-mission-left">
          <div className="dash-mission-tag">Our Purpose</div>
          <div className="dash-mission-title-full">Our Mission &amp; Goals 🌿</div>
          <div className="dash-mission-text-full">
            We build premium organic wellness products for happier, healthier pets — powered by nature and refined by science.
          </div>
        </div>

        <div className="dash-goal-grid">
          {GOALS.map((g, i) => (
            <div
              key={i}
              className={`dash-goal-card dash-goal-flip${flipped === i ? ' is-flipped' : ''}`}
              onClick={() => handleFlip(i)}
            >
              {/* FRONT */}
              <div className="dash-goal-face dash-goal-front">
                <div className="dash-goal-icon">{g.icon}</div>
                <div className="dash-goal-title">{g.text}</div>
                <div className="dash-goal-tap">Tap to read &nbsp;›</div>
              </div>
              {/* BACK */}
              <div className="dash-goal-face dash-goal-back">
                <div className="dash-goal-back-icon">{g.icon}</div>
                <div className="dash-goal-back-title">{g.text}</div>
                <div className="dash-goal-back-text">{g.sub}</div>
                <div className="dash-goal-tap dash-goal-tap--back">← Tap to close</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
