const marqueeItems = [
  '100% Natural', 'Vet Approved', 'Grass-Fed Tallow',
  'Zero Harsh Chemicals', 'Deep Hydration', 'Allergy Relief',
  'Sustainable Packaging', 'Happy Pets Guaranteed',
];

export default function Marquee() {
  return (
    <div className="marquee-wrap sr">
      <div className="marquee-track">
        {/* Duplicate for seamless loop */}
        {[...marqueeItems, ...marqueeItems].map((text, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
    </div>
  );
}
