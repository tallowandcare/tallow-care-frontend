import { useState, useMemo, useCallback } from 'react';
import { PRODUCTS, CATEGORIES } from '../../data/productsData';
import MarketplaceCard from './MarketplaceCard';
import '../../styles/marketplace.css';

const SORT_OPTIONS = [
  { value: 'popular',    label: 'Most Popular' },
  { value: 'price-low',  label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'discount',   label: 'Best Discount' },
];

export default function MarketplaceProducts({ onAddToCart, onQuickView }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const filtered = useMemo(() => {
    let list = activeCategory === 'all'
      ? [...PRODUCTS]
      : PRODUCTS.filter((p) => p.category === activeCategory);

    switch (sortBy) {
      case 'price-low':
        return [...list].sort((a, b) =>
          Math.round(a.originalPrice * (1 - a.discount / 100)) -
          Math.round(b.originalPrice * (1 - b.discount / 100))
        );
      case 'price-high':
        return [...list].sort((a, b) =>
          Math.round(b.originalPrice * (1 - b.discount / 100)) -
          Math.round(a.originalPrice * (1 - a.discount / 100))
        );
      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      case 'discount':
        return [...list].sort((a, b) => b.discount - a.discount);
      default:
        return [...list].sort((a, b) => b.reviewCount - a.reviewCount);
    }
  }, [activeCategory, sortBy]);

  const handleClearFilters = useCallback(() => {
    setActiveCategory('all');
    setSortBy('popular');
  }, []);

  const isFiltered = activeCategory !== 'all' || sortBy !== 'popular';

  return (
    <div className="mkt-root">

      {/* ── Filter Bar ─────────────────────────────────── */}
      <div className="mkt-bar">
        <div className="mkt-bar-inner">

          {/* Category chips */}
          <div className="mkt-cats">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`mkt-cat-chip${activeCategory === cat.id ? ' mkt-cat-chip--active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="mkt-sort-wrap">
            <svg className="mkt-sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/>
              <line x1="10" y1="18" x2="14" y2="18"/>
            </svg>
            <select
              className="mkt-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Results summary ───────────────────────────── */}
      <div className="mkt-results-bar">
        <span className="mkt-results-count">
          <strong>{filtered.length}</strong> product{filtered.length !== 1 ? 's' : ''} found
        </span>
        {isFiltered && (
          <button className="mkt-clear-btn" onClick={handleClearFilters}>
            Clear filters ×
          </button>
        )}
      </div>

      {/* ── Product Grid ─────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="mkt-empty">
          <span className="mkt-empty-icon">🐾</span>
          <p className="mkt-empty-text">No products match your filters.</p>
          <button className="mkt-empty-reset" onClick={handleClearFilters}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="mkt-grid">
          {filtered.map((product) => (
            <MarketplaceCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}
    </div>
  );
}
