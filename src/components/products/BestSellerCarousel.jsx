import { useRef, useState } from 'react';
import { BESTSELLERS } from '../../data/productsData';
import { useCart } from '../../context/CartContext';

/**
 * Sub-component: isolates useCart() so it can do a safe try/catch.
 * Shows "Add to Cart" button OR qty-stepper + green "Added!" pill.
 */
function BSCartButton({ product, onAddToCart }) {
  let cartContext = null;
  try {
    cartContext = useCart();
  } catch {
    cartContext = null;
  }

  const productId = product.id ?? product._id;
  const cartQty   = cartContext ? cartContext.getItemQuantity(productId) : 0;
  const inCart    = cartQty > 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product); // parent handles cart
    } else if (cartContext) {
      cartContext.addToCart(product, 1); // standalone fallback
    }
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    cartContext?.updateQuantity(productId, cartQty + 1);
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    cartContext?.updateQuantity(productId, cartQty - 1);
  };

  if (!inCart || !cartContext) {
    return (
      <button
        className="bs-card-btn"
        onClick={handleAdd}
      >
        Add to Cart
      </button>
    );
  }

  return (
    <div className="bs-cart-state" onClick={e => e.stopPropagation()}>
      <div className="bs-qty-controls">
        <button className="bs-qty-btn" onClick={handleDecrease} aria-label="Decrease">−</button>
        <span className="bs-qty-num">{cartQty}</span>
        <button className="bs-qty-btn" onClick={handleIncrease} aria-label="Increase">+</button>
      </div>
      <button className="bs-added-btn" type="button">✓ Added!</button>
    </div>
  );
}

export default function BestSellerCarousel({ onAddToCart, onQuickView }) {
  const trackRef   = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart  = useRef(0);
  const scrollStart = useRef(0);

  const scroll = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  const onMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current  = e.clientX;
    scrollStart.current = trackRef.current.scrollLeft;
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    trackRef.current.scrollLeft = scrollStart.current - (e.clientX - dragStart.current);
  };

  const onMouseUp = () => setIsDragging(false);

  return (
    <section className="bs-section">
      <div className="bs-header">
        <div>
          <div className="bs-eyebrow">🔥 Trending Now</div>
          <h2 className="bs-title">Best Sellers</h2>
        </div>
        <div className="bs-nav-btns">
          <button className="bs-nav-btn" onClick={() => scroll(-1)} aria-label="Scroll left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button className="bs-nav-btn" onClick={() => scroll(1)} aria-label="Scroll right">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`bs-track${isDragging ? ' bs-track--dragging' : ''}`}
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {BESTSELLERS.map((product) => {
          const price = Math.round(
            Number(product.originalPrice ?? 0) * (1 - Number(product.discount ?? 0) / 100)
          );
          return (
            <div
              key={product.id}
              className="bs-card"
              onClick={() => onQuickView?.(product)}
              role="button"
              tabIndex={0}
            >
              <div className="bs-card-badge">{product.badge}</div>
              <div className="bs-card-img-wrap">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="bs-card-img"
                  loading="lazy"
                />
              </div>
              <div className="bs-card-body">
                <div className="bs-card-tag">{product.forTag}</div>
                <p className="bs-card-name">{product.name}</p>
                <div className="bs-card-stars">
                  {'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}
                </div>
                <div className="bs-card-price-row">
                  <span className="bs-card-price">₹{price}</span>
                  <span className="bs-card-old">₹{product.originalPrice}</span>
                </div>
                <BSCartButton product={product} onAddToCart={onAddToCart} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
