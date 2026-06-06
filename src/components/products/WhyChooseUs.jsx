const REASONS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    title: 'Natural Ingredients',
    desc: 'Every formula is built from nature — organic tallow, cold-pressed oils, and botanicals. Zero synthetics, zero fillers.',
    color: '#8aaa7a',
    bg: 'rgba(138,170,122,0.08)',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    title: 'Vet Approved',
    desc: 'Reviewed and endorsed by licensed veterinary dermatologists before every product launch.',
    color: '#4a7c3f',
    bg: 'rgba(74,124,63,0.08)',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: 'Safe For Cats',
    desc: 'Formulated specifically for feline physiology. Free from all ingredients toxic to cats — always.',
    color: '#e8c94a',
    bg: 'rgba(232,201,74,0.08)',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    title: 'Fast Delivery',
    desc: 'Shipped within 24 hours. Arrives in eco-friendly packaging that\'s as kind to the planet as our products.',
    color: '#a0917e',
    bg: 'rgba(160,145,126,0.08)',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="wcu-section" id="why-choose-us">
      <div className="wcu-eyebrow">Why Tallow &amp; Care?</div>
      <h2 className="wcu-title">Premium Care, Naturally</h2>
      <p className="wcu-sub">
        We believe the best ingredients come from nature — not a lab. Every product is a love letter to your cat's health.
      </p>

      <div className="wcu-grid">
        {REASONS.map((r, i) => (
          <div
            className="wcu-card"
            key={i}
            style={{ '--wcu-color': r.color, '--wcu-bg': r.bg }}
          >
            <div className="wcu-icon">{r.icon}</div>
            <h3 className="wcu-card-title">{r.title}</h3>
            <p className="wcu-card-desc">{r.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
