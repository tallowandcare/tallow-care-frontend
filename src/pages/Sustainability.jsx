import useScrollReveal from '../hooks/useScrollReveal';

const sustainabilityItems = [
  { emoji: '♻️', title: 'Reduce Waste', desc: 'We consciously minimize packaging and utilize fully recyclable materials to keep waste out of landfills.', color: 'ic-yellow' },
  { emoji: '👣', title: 'Lower Carbon Footprints', desc: 'Our operations are streamlined to lower emissions, sourcing locally where possible to reduce transport impact.', color: 'ic-green' },
  { emoji: '🔄', title: 'Zero-Waste Production', desc: 'We utilize every part of our raw materials, ensuring that our manufacturing process produces virtually zero waste.', color: 'ic-coral' },
  { emoji: '🌱', title: 'Eco-Friendly Focus', desc: 'Every product choice, from raw ingredients to shipping tape, is made with our planet\'s long-term health in mind.', color: 'ic-green' },
  { emoji: '💧', title: 'Water Conservation', desc: 'Our formulations and cleaning processes are designed to significantly reduce water consumption at every stage.', color: 'ic-blue' },
  { emoji: '🐇', title: 'Cruelty-Free Commitment', desc: 'We never test on animals and partner only with suppliers who uphold the same ethical standards.', color: 'ic-coral' }
];

export default function Sustainability() {
  useScrollReveal();

  return (
    <section id="sustainability" className="mission-bg section-padding" style={{ background: 'var(--color-warm-white)' }}>
      <span className="section-tag sr">Our Impact</span>
      <h2 className="section-title sr sr-delay-1">Sustainability at Our Core</h2>
      <p className="section-sub sr sr-delay-2">
        We believe that caring for your pet shouldn't come at the cost of the Earth. 
        Here is how we make a tangible difference.
      </p>
      
      <div className="mission-grid">
        {sustainabilityItems.map((item, i) => (
          <div 
            key={item.title} 
            className={`mission-item sr sr-delay-${i + 1}`}
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
                <div className={`mission-icon ${item.color}`}>{item.emoji}</div>
                <h3>{item.title}</h3>
                <p className="front-desc">{item.desc}</p>
                <div className="tap-hint">
                  <span>Tap to read</span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
                </div>
              </div>
              <div className="face back">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
