export default function ProductCTA({ onShopNow }) {
  return (
    <section className="pcta-section">
      <div className="pcta-inner">
        <div className="pcta-orb pcta-orb--1" />
        <div className="pcta-orb pcta-orb--2" />

        <div className="pcta-content">
          <div className="pcta-eyebrow">🌿 Limited Time</div>
          <h2 className="pcta-title">
            Give Your Cat the Care<br />
            <span className="pcta-title-accent">They Deserve.</span>
          </h2>
          <p className="pcta-sub">
            Shop our complete range of premium, natural cat care products.
            Free shipping on orders over ₹999.
          </p>

          <div className="pcta-perks">
            <div className="pcta-perk">
              <span>🚀</span> Free shipping ₹999+
            </div>
            <div className="pcta-perk">
              <span>🔄</span> 30-day returns
            </div>
            <div className="pcta-perk">
              <span>🔒</span> Secure checkout
            </div>
          </div>

          <div className="pcta-btns">
            <button className="pcta-btn-primary" onClick={onShopNow}>
              Explore All Products
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <a href="#why-choose-us" className="pcta-btn-secondary">
              Why Natural Care?
            </a>
          </div>
        </div>

        {/* Floating product image */}
        <div className="pcta-img-wrap">
          <img
            src="/products/prod3/_84A9A0AF-32BF-4F13-9920-F74AF24B7BC6_-removebg-preview.png"
            alt="Premium cat care"
            className="pcta-img"
          />
        </div>
      </div>
    </section>
  );
}
