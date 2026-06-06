import { CATEGORIES } from '../../data/productsData';

export default function ProductCategories({ activeCategory, onSelect }) {
  return (
    <section className="prod-categories">
      <div className="prod-categories-inner">
        <div className="prod-categories-label">Browse by Category</div>
        <div className="prod-categories-list">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`prod-cat-chip${activeCategory === cat.id ? ' prod-cat-chip--active' : ''}`}
              onClick={() => onSelect(cat.id)}
            >
              <span className="prod-cat-chip-icon">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
