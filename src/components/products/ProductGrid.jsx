import { useMemo } from 'react';
import { PRODUCTS, CATEGORIES } from '../../data/productsData';
import ProductCard from './ProductCard';

export default function ProductGrid({ activeCategory, onAddToCart, onQuickView }) {
  const filtered = useMemo(() => {
    if (activeCategory === 'all') return PRODUCTS.filter((p) => p.featured);
    return PRODUCTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const categoryLabel = CATEGORIES.find((c) => c.id === activeCategory)?.label || 'Products';

  return (
    <section className="prod-grid-section">
      <div className="prod-grid-header">
        <div>
          <h2 className="prod-grid-title">{categoryLabel}</h2>
          <p className="prod-grid-sub">{filtered.length} products available</p>
        </div>
        <div className="prod-grid-sort">
          <select className="prod-sort-select" defaultValue="popular">
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="prod-grid-empty">
          <span style={{ fontSize: 48 }}>🐾</span>
          <p>No products in this category yet. Check back soon!</p>
        </div>
      ) : (
        <div className="prod-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}
    </section>
  );
}
