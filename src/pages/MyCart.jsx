import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashNavbar from '../components/dashboard/DashNavbar';
import DashFooter from '../components/dashboard/DashFooter';
import { useCart } from '../context/CartContext';
import '../styles/dashboard.css';
import '../styles/cart.css';

function BuyNowModal({ onClose }) {
  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        <div className="cart-modal-icon">🎉</div>
        <h2 className="cart-modal-title">Almost There!</h2>
        <p className="cart-modal-text">
          Payment options are coming soon. We're working on something great for you!
        </p>
        <button className="cart-modal-btn" onClick={onClose}>
          Got it, can't wait!
        </button>
      </div>
    </div>
  );
}

function CartItemRow({ item, onUpdate, onRemove }) {
  const [removing, setRemoving] = useState(false);

  // FIX (Issue #1 – id/_id normalisation): use whichever id field is present.
  const itemId = item.id ?? item._id;

  // FIX (Issue #5 – NaN price): safe calculation with fallbacks.
  const base = Number(item.originalPrice ?? item.price ?? 0);
  const disc = Number(item.discount ?? 0);
  const price = Math.round(base * (1 - disc / 100));
  const subtotal = price * (item.quantity || 0);

  const handleRemove = () => {
    setRemoving(true);
    // FIX (Issue #3 – removeFromCart): pass the normalised itemId.
    setTimeout(() => onRemove(itemId), 350);
  };

  // FIX (Issue #6 – image rendering): handle both array and plain-string images.
  const imageSrc = Array.isArray(item.images)
    ? (item.images[0] || '')
    : (item.images || item.img || '');

  return (
    <div className={`cart-item${removing ? ' cart-item--removing' : ''}`}>
      {/* Product image */}
      <div className="cart-item-img-wrap">
        <img
          src={imageSrc}
          alt={item.name}
          className="cart-item-img"
        />
      </div>

      {/* Info */}
      <div className="cart-item-info">
        <div className="cart-item-tag">{item.forTag}</div>
        <h3 className="cart-item-name">{item.name}</h3>
        <div className="cart-item-price">
          <span className="cart-item-price-new">₹{price}</span>
          {item.originalPrice && (
            <span className="cart-item-price-old">₹{item.originalPrice}</span>
          )}
          {item.discount > 0 && (
            <span className="cart-item-badge">{item.discount}% OFF</span>
          )}
        </div>
      </div>

      {/* Quantity controls — FIX: pass normalised itemId */}
      <div className="cart-item-qty">
        <button
          className="cart-qty-btn"
          onClick={() => onUpdate(itemId, item.quantity - 1)}
          aria-label="Decrease"
        >−</button>
        <span className="cart-qty-num">{item.quantity}</span>
        <button
          className="cart-qty-btn"
          onClick={() => onUpdate(itemId, item.quantity + 1)}
          aria-label="Increase"
        >+</button>
      </div>

      {/* Subtotal */}
      <div className="cart-item-subtotal">
        <span className="cart-item-subtotal-label">Subtotal</span>
        <span className="cart-item-subtotal-value">₹{subtotal}</span>
      </div>

      {/* Remove button */}
      <button
        className="cart-item-remove"
        onClick={handleRemove}
        aria-label="Remove item"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      </button>
    </div>
  );
}

export default function MyCart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, totalCount, grandTotal } = useCart();
  const [showModal, setShowModal] = useState(false);

  const isEmpty = items.length === 0;

  return (
    <div className="dash-root">
      <DashNavbar
        cartCount={totalCount}
        onCartClick={() => {}}
      />

      <div className="cart-page">
        {/* Page header */}
        <div className="cart-header">
          <button className="cart-back-btn" onClick={() => navigate('/dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to Shop
          </button>
          <div>
            <h1 className="cart-title">My Cart</h1>
            <p className="cart-sub">
              {isEmpty ? 'Your cart is empty' : `${totalCount} item${totalCount !== 1 ? 's' : ''} in your cart`}
            </p>
          </div>
        </div>

        {isEmpty ? (
          /* Empty state */
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2 className="cart-empty-title">Your cart is empty</h2>
            <p className="cart-empty-sub">
              Looks like you haven't added anything yet. Explore our products!
            </p>
            <button
              className="cart-empty-btn"
              onClick={() => navigate('/dashboard')}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Item list */}
            <div className="cart-items-col">
              <div className="cart-items-card">
                <div className="cart-items-head">
                  <span>Product</span>
                  <span>Quantity</span>
                  <span>Subtotal</span>
                </div>
                <div className="cart-items-list">
                  {items.map(item => (
                    <CartItemRow
                      key={item.id ?? item._id}   // FIX: normalised key
                      item={item}
                      onUpdate={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="cart-summary-col">
              <div className="cart-summary-card">
                <h2 className="cart-summary-title">Order Summary</h2>

                <div className="cart-summary-rows">
                  {items.map(item => {
                    // FIX (Issue #5): safe price calculation
                    const base = Number(item.originalPrice ?? item.price ?? 0);
                    const disc = Number(item.discount ?? 0);
                    const price = Math.round(base * (1 - disc / 100));
                    return (
                      <div key={item.id ?? item._id} className="cart-summary-row">
                        <span className="cart-summary-row-name">
                          {item.name} <span className="cart-summary-row-qty">×{item.quantity}</span>
                        </span>
                        <span className="cart-summary-row-val">₹{price * item.quantity}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="cart-summary-divider" />

                <div className="cart-summary-shipping">
                  <span>Shipping</span>
                  <span className="cart-summary-free">FREE</span>
                </div>

                <div className="cart-summary-total">
                  <span>Grand Total</span>
                  <span className="cart-summary-total-val">₹{grandTotal}</span>
                </div>

                <button
                  className="cart-buy-btn"
                  onClick={() => setShowModal(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Buy Now
                </button>

                <p className="cart-secure-note">
                  🔒 Secure checkout · Free returns · Trusted brand
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <DashFooter />

      {showModal && <BuyNowModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
