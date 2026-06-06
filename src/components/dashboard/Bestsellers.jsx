import { useCart } from '../../context/CartContext';

// FIX: BESTSELLERS carry full numeric fields (originalPrice, discount, images)
// so CartContext can calculate prices correctly.
const BESTSELLERS = [
  {
    id: 'bs-1',
    badge: 'BESTSELLER', badgeColor: 'var(--dash-sage-dark)',
    img: '/products/prod2/_63AB8781-E897-40A6-9A76-7296AF0A7EE9_-removebg-preview.png',
    images: ['/products/prod2/_63AB8781-E897-40A6-9A76-7296AF0A7EE9_-removebg-preview.png'],
    name: 'Tallow & Neem Dog Soap',
    compat: '🐶 SOOTHES DRY & ITCHY SKIN',
    stars: '★★★★★', price: '₹399', oldPrice: '₹499',
    originalPrice: 499, discount: 20,
  },
  {
    id: 'bs-2',
    badge: '15% OFF', badgeColor: '#e05252',
    img: '/products/prod1/_81BD2ED6-B12D-4CCD-B5FB-790CB9F2ABD0_-removebg-preview.png',
    images: ['/products/prod1/_81BD2ED6-B12D-4CCD-B5FB-790CB9F2ABD0_-removebg-preview.png'],
    name: 'Organic Tallow Healing Salve',
    compat: '🐱 HEALS & MOISTURISES',
    stars: '★★★★★', price: '₹679', oldPrice: '₹799',
    originalPrice: 799, discount: 15,
  },
  {
    id: 'bs-3',
    badge: '25% OFF', badgeColor: '#e05252',
    img: '/products/prod3/_84A9A0AF-32BF-4F13-9920-F74AF24B7BC6_-removebg-preview.png',
    images: ['/products/prod3/_84A9A0AF-32BF-4F13-9920-F74AF24B7BC6_-removebg-preview.png'],
    name: 'Handcrafted Leather Leash',
    compat: '🐶 DURABLE & PREMIUM',
    stars: '★★★★★', price: '₹899', oldPrice: '₹1,199',
    originalPrice: 1199, discount: 25,
  },
  {
    id: 'bs-4',
    badge: 'HOT', badgeColor: 'var(--dash-sage-dark)',
    img: '/products/prod4/1.png',
    images: ['/products/prod4/1.png'],
    name: 'Pure Organic Catnip Mist',
    compat: '🐱 CALMING & ORGANIC',
    stars: '★★★★☆', price: '₹299', oldPrice: '₹349',
    originalPrice: 349, discount: 14,
  },
];

/**
 * Sub-component: cart button per bestseller card.
 * Renders "Add to Cart" OR qty stepper + green "✓ Added!" pill.
 */
function DashCartButton({ product, onAddToCart }) {
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
    e?.stopPropagation();
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
      <button className="dash-add-cart" onClick={handleAdd}>
        Add to Cart
      </button>
    );
  }

  return (
    <div className="dash-cart-state" onClick={e => e.stopPropagation()}>
      <div className="dash-qty-row">
        <button className="dash-qty-btn" onClick={handleDecrease} aria-label="Decrease">−</button>
        <span className="dash-qty-num">{cartQty}</span>
        <button className="dash-qty-btn" onClick={handleIncrease} aria-label="Increase">+</button>
      </div>
      <button className="dash-added-btn" type="button">✓ Added!</button>
    </div>
  );
}

export default function Bestsellers({ onAddToCart }) {
  const count = BESTSELLERS.length;

  return (
    <section className="dash-section">
      <div className="dash-section-head">
        <div className="dash-section-title">Our Bestsellers</div>
        <button className="dash-section-btn">See All →</button>
      </div>
      <div className={`dash-products${count === 1 ? ' dash-products--single' : ''}`}>
        {BESTSELLERS.map(p => (
          <div key={p.id} className="dash-product-card">
            <div className="dash-discount" style={{ background: p.badgeColor }}>{p.badge}</div>
            <div className="dash-product-image">
              <img src={p.img} alt={p.name} className="dash-product-img" />
            </div>
            <div className="dash-product-name">{p.name}</div>
            {p.compat && <div className="dash-pet-compat-label">{p.compat}</div>}
            <div className="dash-stars">{p.stars}</div>
            <div className="dash-price">
              <div className="dash-new-price">{p.price}</div>
              <div className="dash-old-price">{p.oldPrice}</div>
            </div>
            <DashCartButton product={p} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </section>
  );
}
