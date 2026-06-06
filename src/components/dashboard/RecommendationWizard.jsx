import { useState, useRef } from 'react';
import { useCart } from '../../context/CartContext';

// FIX (Bonus – id/_id normalisation + cart fields): CURATED_PRODUCTS now
// carries the numeric originalPrice / discount / images fields that CartContext
// needs, in addition to the display strings (price, oldPrice) that the UI uses.
const CURATED_PRODUCTS = [
  {
    id: 'rw-1', petType: ['dog'], categories: ['skin', 'organic'],
    tag: 'BEST FOR PAWS 🐾', tagClass: 'tag-bruno',
    img: '/products/prod2/_63AB8781-E897-40A6-9A76-7296AF0A7EE9_-removebg-preview.png',
    images: ['/products/prod2/_63AB8781-E897-40A6-9A76-7296AF0A7EE9_-removebg-preview.png'],
    name: 'Organic Tallow Paw Balm',
    compat: '🐶 Ideal for Sensitive Skin', compatClass: 'dog',
    stars: '★★★★★', price: '₹599', oldPrice: '₹849',
    originalPrice: 849, discount: 29,
  },
  {
    id: 'rw-2', petType: ['dog'], categories: ['diet'],
    tag: '15% OFF', tagClass: 'tag-discount',
    img: '/products/prod3/_84A9A0AF-32BF-4F13-9920-F74AF24B7BC6_-removebg-preview.png',
    images: ['/products/prod3/_84A9A0AF-32BF-4F13-9920-F74AF24B7BC6_-removebg-preview.png'],
    name: 'Premium High-Protein Dog Food',
    compat: '🐶 High Energy & Performance', compatClass: 'dog',
    stars: '★★★★★', price: '₹1,299', oldPrice: '₹1,499',
    originalPrice: 1499, discount: 13,
  },
  {
    id: 'rw-3', petType: ['cat'], categories: ['dental'],
    tag: 'DENTAL CARE 🦷', tagClass: 'tag-mochi',
    img: '/products/prod1/_5A2EE1DC-46DD-41FE-9D67-844507B7FF8A_-removebg-preview.png',
    images: ['/products/prod1/_5A2EE1DC-46DD-41FE-9D67-844507B7FF8A_-removebg-preview.png'],
    name: 'Gourmet Cat Dental Treats',
    compat: '🐱 Cleans teeth & fresh breath', compatClass: 'cat',
    stars: '★★★★★', price: '₹449', oldPrice: '₹599',
    originalPrice: 599, discount: 25,
  },
  {
    id: 'rw-4', petType: ['cat', 'dog'], categories: ['anxiety', 'organic'],
    tag: 'ORGANIC 🌱', tagClass: 'tag-organic',
    img: '/products/prod4/1.png',
    images: ['/products/prod4/1.png'],
    name: 'All-Natural Calming Mist',
    compat: '🐾 Calming Aromatherapy', compatClass: 'both',
    stars: '★★★★☆', price: '₹349', oldPrice: '₹499',
    originalPrice: 499, discount: 30,
  },
  {
    id: 'rw-5', petType: ['dog'], categories: ['skin', 'organic'],
    tag: 'ORGANIC SOAP 🧼', tagClass: 'tag-organic',
    img: '/products/prod2/_4C98F61E-6929-48FA-B720-9E937DE5F643_-removebg-preview.png',
    images: ['/products/prod2/_4C98F61E-6929-48FA-B720-9E937DE5F643_-removebg-preview.png'],
    name: 'Tallow & Neem Dog Soap',
    compat: '🐶 Soothes dry & itchy skin', compatClass: 'dog',
    stars: '★★★★★', price: '₹399', oldPrice: '₹499',
    originalPrice: 499, discount: 20,
  },
  {
    id: 'rw-6', petType: ['cat'], categories: ['skin', 'organic'],
    tag: 'ORGANIC BALM 🌱', tagClass: 'tag-mochi',
    img: '/products/prod1/_81BD2ED6-B12D-4CCD-B5FB-790CB9F2ABD0_-removebg-preview.png',
    images: ['/products/prod1/_81BD2ED6-B12D-4CCD-B5FB-790CB9F2ABD0_-removebg-preview.png'],
    name: 'Cat Tallow Skin Balm',
    compat: '🐱 Ultra pure organic skin hydration', compatClass: 'cat',
    stars: '★★★★★', price: '₹499', oldPrice: '₹649',
    originalPrice: 649, discount: 23,
  },
];

const LOADER_PHASES = [
  '🔍 Analyzing your pet\'s profile...',
  '🌱 Sifting custom organic ingredients...',
  '✨ Formulating optimal care recipes...',
];

const CONCERNS = [
  { value: 'skin', label: 'Sensitive Skin & Paw Care 🐾' },
  { value: 'diet', label: 'Active Diet & Energy 🦴' },
  { value: 'anxiety', label: 'Anxiety & Stress Relief 🌿' },
  { value: 'dental', label: 'Dental & Oral Hygiene 🦷' },
];

const CONCERN_LABELS = {
  skin: 'sensitive skin and paw care',
  diet: 'active nutrition and digestive health',
  anxiety: 'stress and anxiety relief',
  dental: 'dental hygiene and fresh breath',
};

const FILTER_TABS = [
  { value: 'all', label: '✨ All Picks' },
  { value: 'skin', label: '🌿 Skin & Paw' },
  { value: 'diet', label: '🦴 Diet & Energy' },
  { value: 'anxiety', label: '💆 Stress Relief' },
  { value: 'dental', label: '🦷 Dental Care' },
];

export default function RecommendationWizard({ onAddToCart }) {
  const [step, setStep] = useState('form'); // 'form' | 'loading' | 'results'
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('dog');
  const [concern, setConcern] = useState('skin');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loaderPhase, setLoaderPhase] = useState(0);
  const [resultPetName, setResultPetName] = useState('');

  // Use CartContext for real cart state — no more local addedCards animation state
  let cartContext = null;
  try {
    cartContext = useCart();
  } catch {
    cartContext = null;
  }
  const [resultPetType, setResultPetType] = useState('dog');
  const [resultConcern, setResultConcern] = useState('skin');
  const sectionRef = useRef(null);

  const handleGenerate = () => {
    const name = petName.trim() || 'Your Pet';
    setResultPetName(name);
    setResultPetType(petType);
    setResultConcern(concern);
    setLoaderPhase(0);
    setStep('loading');
    setActiveFilter('all');

    let phase = 0;
    const interval = setInterval(() => {
      phase++;
      if (phase < LOADER_PHASES.length) setLoaderPhase(phase);
    }, 600);

    setTimeout(() => {
      clearInterval(interval);
      setStep('results');
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 2000);
  };

  const handleReset = () => {
    setStep('form');
    setPetName('');
    setActiveFilter('all');
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Add to cart: call CartContext directly (CURATED_PRODUCTS have full numeric fields)
  // Also forward to parent's onAddToCart for any page-level logic (e.g. toast).
  const handleAddToCart = (id) => {
    const product = CURATED_PRODUCTS.find(p => p.id === id);
    if (!product) return;
    if (onAddToCart) {
      onAddToCart(product); // parent handles cart + toast
    } else if (cartContext) {
      cartContext.addToCart(product, 1); // standalone fallback
    }
  };

  const handleIncrease = (id) => {
    const productId = id;
    const qty = cartContext ? cartContext.getItemQuantity(productId) : 0;
    cartContext?.updateQuantity(productId, qty + 1);
  };

  const handleDecrease = (id) => {
    const productId = id;
    const qty = cartContext ? cartContext.getItemQuantity(productId) : 0;
    cartContext?.updateQuantity(productId, qty - 1);
  };

  const visibleProducts = CURATED_PRODUCTS.filter(p => {
    const typeMatch = p.petType.includes(resultPetType);
    if (!typeMatch) return false;
    if (activeFilter === 'all') {
      return p.categories.includes(resultConcern) || p.categories.includes('organic');
    }
    return p.categories.includes(activeFilter);
  });

  return (
    <section className="dash-section" id="recommendations-section" ref={sectionRef}>
      {/* WIZARD FORM */}
      {step === 'form' && (
        <div className="dash-wizard-card">
          <div className="dash-wizard-title">Tailor Your Pet's Care Recipe 🌿</div>
          <div className="dash-wizard-desc">
            Describe your pet below to generate highly personalized, organic tallow care recommendations instantly.
          </div>
          <div className="dash-wizard-row">
            <div className="dash-wizard-group">
              <label className="dash-wizard-label">Pet's Name</label>
              <input
                type="text"
                className="dash-wizard-input"
                placeholder="e.g. Bruno, Mochi..."
                value={petName}
                onChange={e => setPetName(e.target.value)}
              />
            </div>
            <div className="dash-wizard-group">
              <label className="dash-wizard-label">Pet Type</label>
              <div className="dash-pet-selector">
                <button
                  type="button"
                  className={`dash-pet-type-btn${petType === 'dog' ? ' active' : ''}`}
                  onClick={() => setPetType('dog')}
                >
                  🐶 Dog
                </button>
                <button
                  type="button"
                  className={`dash-pet-type-btn${petType === 'cat' ? ' active' : ''}`}
                  onClick={() => setPetType('cat')}
                >
                  🐱 Cat
                </button>
              </div>
            </div>
            <div className="dash-wizard-group">
              <label className="dash-wizard-label">Primary Care Need</label>
              <select
                className="dash-wizard-input"
                value={concern}
                onChange={e => setConcern(e.target.value)}
              >
                {CONCERNS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            className="dash-wizard-submit"
            onClick={handleGenerate}
          >
            Generate Tailored Recommendations ✨
          </button>
        </div>
      )}

      {/* LOADER */}
      {step === 'loading' && (
        <div className="dash-wizard-card dash-wizard-loader">
          <div className="dash-loader-paw">🐾</div>
          <div className="dash-loader-text">{LOADER_PHASES[loaderPhase]}</div>
          <div className="dash-loader-bar-bg">
            <div className="dash-loader-bar" key={loaderPhase} />
          </div>
        </div>
      )}

      {/* RESULTS */}
      {step === 'results' && (
        <div className="dash-wizard-results">
          <div className="dash-rec-header">
            <div className="dash-rec-meta">
              <div className="dash-section-title">
                Curated Specially For {resultPetName} 🌟
              </div>
              <button type="button" className="dash-change-profile-btn" onClick={handleReset}>
                🔄 Reset Profile
              </button>
            </div>
            <div className="dash-rec-subtitle">
              Handpicked premium recipes formulated for your {resultPetType}'s {CONCERN_LABELS[resultConcern]}.
            </div>
          </div>
          <div className="dash-rec-tabs">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.value}
                type="button"
                className={`dash-rec-tab${activeFilter === tab.value ? ' active' : ''}`}
                onClick={() => setActiveFilter(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="dash-products dash-curated-products">
            {visibleProducts.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--dash-light)' }}>
                No products match this filter for your pet. Try a different category.
              </div>
            )}
            {visibleProducts.map(p => {
              const cartQty = cartContext ? cartContext.getItemQuantity(p.id) : 0;
              const inCart  = cartQty > 0;
              return (
                <div key={p.id} className="dash-product-card dash-curated-card">
                  <div className="dash-product-image-container">
                    <div className={`dash-product-tag ${p.tagClass}`}>{p.tag}</div>
                    <img src={p.img} alt={p.name} className="dash-product-img" />
                  </div>
                  <div className="dash-product-name">{p.name}</div>
                  <div className={`dash-pet-compat ${p.compatClass}`}>{p.compat}</div>
                  <div className="dash-stars">{p.stars}</div>
                  <div className="dash-price">
                    <div className="dash-new-price">{p.price}</div>
                    <div className="dash-old-price">{p.oldPrice}</div>
                  </div>
                  {!inCart || !cartContext ? (
                    <button
                      className="dash-add-cart"
                      onClick={() => handleAddToCart(p.id)}
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="dash-cart-state" onClick={e => e.stopPropagation()}>
                      <div className="dash-qty-row">
                        <button className="dash-qty-btn" onClick={() => handleDecrease(p.id)} aria-label="Decrease">−</button>
                        <span className="dash-qty-num">{cartQty}</span>
                        <button className="dash-qty-btn" onClick={() => handleIncrease(p.id)} aria-label="Increase">+</button>
                      </div>
                      <button className="dash-added-btn" type="button">✓ Added!</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
