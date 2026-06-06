import { useState, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoginRequiredPopup from '../components/LoginRequiredPopup';

// Products now carry stable IDs so CartContext can track them.
const products = [
  {
    id: 'home-prod-1',
    name: 'Feline Gentle Care',
    forTag: 'Cats',
    desc: 'Gentle, vet-safe care made for sensitive feline skin.',
    originalPrice: 200,
    discount: 51,
    stars: '★★★★★',
    count: 142,
    images: [
      '/products/prod1/image.png',
      '/products/prod1/_5A2EE1DC-46DD-41FE-9D67-844507B7FF8A_-removebg-preview.png',
      '/products/prod1/_81BD2ED6-B12D-4CCD-B5FB-790CB9F2ABD0_-removebg-preview.png'
    ]
  },
  {
    id: 'home-prod-2',
    name: 'Canine Active Protection',
    forTag: 'Dogs',
    desc: 'Strong cleansing with natural protection for active dogs.',
    originalPrice: 200,
    discount: 51,
    stars: '★★★★★',
    count: 98,
    images: [
      '/products/prod2/image.png',
      '/products/prod2/_4C98F61E-6929-48FA-B720-9E937DE5F643_-removebg-preview.png',
      '/products/prod2/_63AB8781-E897-40A6-9A76-7296AF0A7EE9_-removebg-preview.png'
    ]
  },
  {
    id: 'home-prod-3',
    name: 'Universal Pet Health',
    forTag: 'All Pets',
    desc: 'Universal care products safe for every animal.',
    originalPrice: 200,
    discount: 51,
    stars: '★★★★★',
    count: 207,
    images: [
      '/products/prod3/image.png',
      '/products/prod3/_84A9A0AF-32BF-4F13-9920-F74AF24B7BC6_-removebg-preview.png',
      '/products/prod3/_4FEBF93A-8511-4358-AC0A-ECE2A409DAC6_-removebg-preview.png'
    ]
  }
];

// Auto-cycling image slider (unchanged from original)
const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`Product slide ${idx}`}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            objectFit: 'contain',
            padding: '24px',
            opacity: currentIndex === idx ? 1 : 0,
            transition: 'opacity 0.4s ease-in-out'
          }}
        />
      ))}
    </div>
  );
};

export default function Products({ showToast }) {
  useScrollReveal();

  // Auth state — block guests from adding to cart
  const { user } = useAuth();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // CartContext — optional, falls back if not in provider
  let cartContext = null;
  try {
    cartContext = useCart();
  } catch {
    cartContext = null;
  }

  const handleAddToCart = (product) => {
    // 🔒 Auth guard
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    if (cartContext) cartContext.addToCart(product, 1);
    showToast?.('Added to cart! 🎉');
  };

  const handleIncrease = (product) => {
    if (!user) { setShowLoginPopup(true); return; }
    const productId = product.id ?? product._id;
    const qty = cartContext ? cartContext.getItemQuantity(productId) : 0;
    cartContext?.updateQuantity(productId, qty + 1);
  };

  const handleDecrease = (product) => {
    if (!user) { setShowLoginPopup(true); return; }
    const productId = product.id ?? product._id;
    const qty = cartContext ? cartContext.getItemQuantity(productId) : 0;
    cartContext?.updateQuantity(productId, qty - 1);
  };

  return (
    <section id="products" className="products-bg section-padding page-top">
      {/* Auth-required popup */}
      <LoginRequiredPopup
        visible={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
      />
      <span className="section-tag sr">Our Collection</span>
      <h2 className="section-title sr sr-delay-1">Premium Products</h2>
      <p className="section-sub sr sr-delay-2">
        Handcrafted with love, formulated with science. Each product is designed
        to heal and protect your pet's skin naturally.
      </p>

      <div className="products-grid">
        {products.map((p, i) => {
          const productId = p.id ?? p._id;
          const cartQty   = cartContext ? cartContext.getItemQuantity(productId) : 0;
          const inCart    = cartQty > 0;

          return (
            <div
              key={p.name}
              className={`product-card sr sr-delay-${i + 1} ${
                products.length % 2 === 1 && i === products.length - 1
                  ? 'product-card-last'
                  : ''
              }`}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) / (rect.width / 2);
                const dy = (e.clientY - cy) / (rect.height / 2);
                e.currentTarget.style.transform =
                  `translateY(-8px) perspective(600px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg) scale(1.01)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
              }}
            >
              <div
                className="product-img-wrap"
                style={{
                  background: 'radial-gradient(circle at center, #ffffff 0%, #f2efe9 100%)',
                  padding: 0
                }}
              >
                <span
                  className="product-badge"
                  style={{
                    zIndex: 10,
                    background: 'var(--color-sage)',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(119,138,108,.3)',
                    fontWeight: '600'
                  }}
                >
                  {p.forTag}
                </span>
                <ImageSlider images={p.images} />
              </div>

              <div className="product-info" style={{ padding: '24px 20px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--color-text-dark)', fontWeight: '700', letterSpacing: '-0.3px' }}>
                  {p.name}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5', marginBottom: '20px' }}>
                  {p.desc}
                </p>

                <div className="product-footer" style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-text-dark)', letterSpacing: '-0.5px' }}>
                        ₹{Math.round(p.originalPrice * (1 - p.discount / 100))}
                      </span>
                      <span style={{ textDecoration: 'line-through', color: '#a0a0a0', fontSize: '0.95rem', fontWeight: '500' }}>
                        ₹{p.originalPrice}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#d35400', fontWeight: '700', background: '#ffeaa7', padding: '4px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(211,84,0,0.15)' }}>
                      🔥 {p.discount}% OFF
                    </span>
                  </div>

                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#f39c12', fontSize: '0.9rem', letterSpacing: '1px' }}>{p.stars}</span>
                    <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: '500' }}>({p.count} reviews)</span>
                  </div>
                </div>

                {/* Cart: "Add to Cart" OR qty stepper + green "✓ Added!" */}
                {!inCart || !cartContext ? (
                  <button
                    className="btn-cart"
                    onClick={() => handleAddToCart(p)}
                  >
                    🛒 Add to Cart
                  </button>
                ) : (
                  <div className="btn-cart-state">
                    <div className="btn-qty-controls">
                      <button className="btn-qty-btn" onClick={() => handleDecrease(p)} aria-label="Decrease">−</button>
                      <span className="btn-qty-num">{cartQty}</span>
                      <button className="btn-qty-btn" onClick={() => handleIncrease(p)} aria-label="Increase">+</button>
                    </div>
                    <button className="btn-added" type="button">✓ Added!</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="view-all-wrap sr">
        <a href="#products" className="btn-outline">
          View All Products →
        </a>
      </div>
    </section>
  );
}
