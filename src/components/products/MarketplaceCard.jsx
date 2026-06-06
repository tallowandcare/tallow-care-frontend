import { useState, useCallback } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import LoginRequiredPopup from '../LoginRequiredPopup';

function Stars({ rating }) {
  return (
    <span className="mc-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? '#e8a820' : '#d8d0c4' }}>★</span>
      ))}
    </span>
  );
}

export default function MarketplaceCard({ product, onAddToCart, onQuickView }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // AuthContext — always available
  const { user } = useAuth();

  const handleClosePopup = useCallback(() => setShowLoginPopup(false), []);

  // CartContext is optional — falls back gracefully if not inside CartProvider
  let cartContext = null;
  try {
    cartContext = useCart();
  } catch {
    cartContext = null;
  }

  // Normalise id so both id and _id variants work
  const productId = product.id ?? product._id;

  const cartQty   = cartContext ? cartContext.getItemQuantity(productId) : 0;
  const inCart    = cartQty > 0;

  // FIX: safe price calculation with fallbacks
  const base           = Number(product.originalPrice ?? product.price ?? 0);
  const disc           = Number(product.discount ?? 0);
  const discountedPrice = Math.round(base * (1 - disc / 100));

  const badgeClass =
    product.badgeType === 'hot' ? 'mc-badge--hot'
    : product.badgeType === 'new' ? 'mc-badge--new'
    : 'mc-badge--sale';

  // Handle both array and plain-string images
  const imageSrc = Array.isArray(product.images)
    ? (product.images[0] || '')
    : (product.images || product.img || '');

  // ── Cart handlers ──────────────────────────────────────────
  const handleAddToCart = (e) => {
    e.stopPropagation();

    // 🔒 Auth guard — block guests from adding to cart
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    if (onAddToCart) {
      onAddToCart(product); // parent handles cart
    } else if (cartContext) {
      cartContext.addToCart(product, 1); // standalone fallback
    }
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    if (!user) { setShowLoginPopup(true); return; }
    cartContext?.updateQuantity(productId, cartQty + 1);
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    if (!user) { setShowLoginPopup(true); return; }
    cartContext?.updateQuantity(productId, cartQty - 1);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setWishlisted((w) => !w);
  };

  return (
    <>
      <LoginRequiredPopup visible={showLoginPopup} onClose={handleClosePopup} />

      <div
        className="mc-card"
        onClick={() => onQuickView?.(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onQuickView?.(product)}
      >
      {/* ── Image column ── */}
      <div className="mc-img-col">
        {product.badge && (
          <div className={`mc-badge ${badgeClass}`}>{product.badge}</div>
        )}
        <img
          src={imageSrc}
          alt={product.name}
          className="mc-img"
          loading="lazy"
        />
      </div>

      {/* ── Content column ── */}
      <div className="mc-content">
        <div className="mc-content-top">
          <div className="mc-tags-row">
            <span className="mc-for-tag">{product.forTag}</span>
            <span className={`mc-cat-tag mc-cat-tag--${product.category}`}>
              {product.category}
            </span>
          </div>

          <h3 className="mc-name">{product.name}</h3>
          <p className="mc-desc">{product.shortDesc}</p>

          <div className="mc-rating-row">
            <Stars rating={product.rating} />
            <span className="mc-review-count">({product.reviewCount} reviews)</span>
          </div>

          {/* Benefits chips — desktop only */}
          <div className="mc-benefits-row">
            {(product.benefits || []).slice(0, 2).map((b, i) => (
              <span key={i} className="mc-benefit-chip">✓ {b}</span>
            ))}
          </div>
        </div>

        {/* ── Price + Actions ── */}
        <div className="mc-footer">
          <div className="mc-price-block">
            <span className="mc-price-new">₹{discountedPrice}</span>
            <span className="mc-price-old">₹{product.originalPrice}</span>
            <span className="mc-discount-pill">🔥 {product.discount}% OFF</span>
          </div>

          <div className="mc-actions">
            <button
              className={`mc-wishlist-btn${wishlisted ? ' mc-wishlist-btn--active' : ''}`}
              onClick={handleWishlist}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Cart: Add to Cart OR qty stepper + Added! */}
            {!inCart || !cartContext ? (
              <button
                className="mc-cart-btn"
                onClick={handleAddToCart}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Add to Cart
              </button>
            ) : (
              <div className="mc-cart-state" onClick={e => e.stopPropagation()}>
                <div className="mc-qty-row">
                  <button className="mc-qty-btn" onClick={handleDecrease} aria-label="Decrease">−</button>
                  <span className="mc-qty-num">{cartQty}</span>
                  <button className="mc-qty-btn" onClick={handleIncrease} aria-label="Increase">+</button>
                </div>
                <button className="mc-added-btn" type="button">✓ Added!</button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
