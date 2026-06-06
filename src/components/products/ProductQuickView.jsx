import { useState, useEffect, useRef } from 'react';

function StarRating({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? '#e8c94a' : '#d8d0c4', fontSize: 18 }}>★</span>
      ))}
    </span>
  );
}

export default function ProductQuickView({ product, onClose, onAddToCart }) {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false); // FIX: Buy Now modal state
  const overlayRef = useRef(null);

  // Normalise images to always be an array
  const images = Array.isArray(product.images)
    ? product.images
    : (product.images ? [product.images] : (product.img ? [product.img] : []));

  // Safe price calculation
  const base = Number(product.originalPrice ?? product.price ?? 0);
  const disc = Number(product.discount ?? 0);
  const discountedPrice = Math.round(base * (1 - disc / 100));

  useEffect(() => {
    setActiveImg(0);
    setQty(1);
    setAdded(false);
    setShowBuyModal(false);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Add to Cart action
  const handleAdd = () => {
    onAddToCart?.(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  // Buy Now action — adds to cart AND shows the "Almost There!" modal
  const handleBuyNow = () => {
    handleAdd();
    setShowBuyModal(true);
  };

  return (
    <div className="qv-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="qv-modal" role="dialog" aria-modal="true" aria-label={product.name}>
        {/* Close */}
        <button className="qv-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="qv-body">
          {/* Gallery */}
          <div className="qv-gallery">
            <div className="qv-main-img-wrap">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.name} view ${i + 1}`}
                  className={`qv-main-img${activeImg === i ? ' qv-main-img--active' : ''}`}
                />
              ))}
              {images.length === 0 && (
                <div className="qv-main-img qv-main-img--active" style={{ background: '#f0ede8' }} />
              )}
            </div>
            {images.length > 1 && (
              <div className="qv-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`qv-thumb${activeImg === i ? ' qv-thumb--active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="qv-details">
            <div className="qv-tag">{product.forTag}</div>
            <h2 className="qv-name">{product.name}</h2>

            <div className="qv-rating-row">
              <StarRating rating={product.rating} />
              <span className="qv-review-cnt">({product.reviewCount} reviews)</span>
            </div>

            <p className="qv-desc">{product.shortDesc}</p>

            <div className="qv-price-row">
              <span className="qv-price-new">₹{discountedPrice}</span>
              <span className="qv-price-old">₹{product.originalPrice}</span>
              <span className="qv-price-badge">{product.discount}% OFF</span>
            </div>

            {product.benefits && (
              <div className="qv-block">
                <h4 className="qv-block-title">Benefits</h4>
                <ul className="qv-benefits">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="qv-benefit-item">
                      <span className="qv-benefit-check">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.ingredients && (
              <div className="qv-block">
                <h4 className="qv-block-title">Key Ingredients</h4>
                <p className="qv-ingredients">{product.ingredients}</p>
              </div>
            )}

            {/* Qty + Buttons */}
            <div className="qv-actions">
              <div className="qv-qty">
                <button
                  className="qv-qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                >−</button>
                <span className="qv-qty-num">{qty}</span>
                <button
                  className="qv-qty-btn"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase"
                >+</button>
              </div>

              <button
                className={`qv-btn-cart${added ? ' qv-btn-cart--added' : ''}`}
                onClick={handleAdd}
              >
                {added ? '✓ Added!' : '🛒 Add to Cart'}
              </button>

              {/* FIX: Buy Now now triggers the "Almost There!" modal */}
              <button className="qv-btn-buy" onClick={handleBuyNow}>
                Buy Now →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── "Almost There!" Buy Now Modal ── */}
      {showBuyModal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowBuyModal(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 20,
              padding: '40px 32px', maxWidth: 420, width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
            <h2 style={{
              fontSize: 24, fontWeight: 700,
              marginBottom: 10, color: '#2a2318',
            }}>
              Almost There!
            </h2>
            <p style={{ color: '#6b5c47', marginBottom: 24, lineHeight: 1.6 }}>
              Payment options are coming soon. We're working on something great for you!
            </p>
            <button
              style={{
                background: '#4a7c3f', color: '#fff',
                border: 'none', borderRadius: 10,
                padding: '14px 28px', fontSize: 16,
                fontWeight: 600, cursor: 'pointer', width: '100%',
              }}
              onClick={() => setShowBuyModal(false)}
            >
              Got it, can't wait!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
