import { useState, useCallback } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import LoginRequiredPopup from '../LoginRequiredPopup';

function StarRating({ rating, size = 14 }) {
  return (
    <span className="prod-card-stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? '#e8c94a' : '#d8d0c4' }}>★</span>
      ))}
    </span>
  );
}

export default function ProductCard({ product, onAddToCart, onQuickView }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // AuthContext — always available (AuthProvider wraps the whole app)
  const { user } = useAuth();

  // CartContext is optional — falls back gracefully if not inside CartProvider
  let cartContext = null;
  try {
    cartContext = useCart();
  } catch {
    cartContext = null;
  }

  const handleClosePopup = useCallback(() => setShowLoginPopup(false), []);

  // FIX (Issue #1 – id/_id normalisation): always use a single consistent id
  const productId = product.id ?? product._id;

  const cartQty = cartContext ? cartContext.getItemQuantity(productId) : 0;
  const inCart = cartQty > 0;

  // FIX (Issue #5 – NaN price): safe calculation with fallbacks
  const base = Number(product.originalPrice ?? product.price ?? 0);
  const disc = Number(product.discount ?? 0);
  const discountedPrice = Math.round(base * (1 - disc / 100));

  const badgeStyle =
    product.badgeType === 'hot' ? 'prod-card-badge--hot'
    : product.badgeType === 'new' ? 'prod-card-badge--new'
    : 'prod-card-badge--discount';

  // FIX (Issue #6 – image rendering): handle both array and plain-string images
  const imageSrc = Array.isArray(product.images)
    ? (product.images[0] || '')
    : (product.images || product.img || '');

  const handleAddToCart = (e) => {
    e.stopPropagation();

    // 🔒 Auth guard — block guests from adding to cart
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    if (onAddToCart) {
      onAddToCart(product); // parent handles cart + side-effects (toast etc.)
    } else if (cartContext) {
      cartContext.addToCart(product, 1); // standalone fallback (no parent)
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
    // FIX: pass normalised productId
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
        className="prod-card"
        onClick={() => onQuickView?.(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onQuickView?.(product)}
      >
      {/* Badge */}
      {product.badge && (
        <div className={`prod-card-badge ${badgeStyle}`}>{product.badge}</div>
      )}

      {/* Wishlist */}
      <button
        className={`prod-card-wishlist${wishlisted ? ' prod-card-wishlist--active' : ''}`}
        onClick={handleWishlist}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      {/* Image — FIX: use safe imageSrc instead of product.images[0] */}
      <div className="prod-card-img-wrap">
        <img
          src={imageSrc}
          alt={product.name}
          className="prod-card-img"
          loading="lazy"
        />
        <div className="prod-card-overlay">
          <span className="prod-card-qv-label">Quick View</span>
        </div>
      </div>

      {/* Info */}
      <div className="prod-card-info">
        <div className="prod-card-tag">{product.forTag}</div>
        <h3 className="prod-card-name">{product.name}</h3>
        <p className="prod-card-desc">{product.shortDesc}</p>

        <div className="prod-card-rating-row">
          <StarRating rating={product.rating} />
          <span className="prod-card-review-count">({product.reviewCount})</span>
        </div>

        <div className="prod-card-price-row">
          <div className="prod-card-prices">
            <span className="prod-card-price-new">₹{discountedPrice}</span>
            <span className="prod-card-price-old">₹{product.originalPrice}</span>
          </div>
          <div className="prod-card-discount-pill">🔥 {product.discount}% OFF</div>
        </div>

        {/* Cart button — "Add to Cart" or quantity stepper + Added! */}
        {!inCart || !cartContext ? (
          <button
            className="prod-card-btn"
            onClick={handleAddToCart}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Add to Cart
          </button>
        ) : (
          <div className="prod-card-cart-state" onClick={e => e.stopPropagation()}>
            <div className="prod-card-qty-controls">
              <button className="prod-card-qty-btn" onClick={handleDecrease} aria-label="Decrease">−</button>
              <span className="prod-card-qty-num">{cartQty}</span>
              <button className="prod-card-qty-btn" onClick={handleIncrease} aria-label="Increase">+</button>
            </div>
            <button className="prod-card-added-btn" type="button">✓ Added!</button>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
