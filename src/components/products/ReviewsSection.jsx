import { REVIEWS } from '../../data/productsData';

export default function ReviewsSection() {
  return (
    <section className="rev-section">
      <div className="rev-eyebrow">❤️ Real Stories</div>
      <h2 className="rev-title">What Cat Parents Say</h2>
      <p className="rev-sub">
        Over 4,200 cats are living healthier, happier lives. Here's what their humans had to say.
      </p>

      <div className="rev-grid">
        {REVIEWS.map((r) => (
          <div className="rev-card" key={r.id}>
            <div className="rev-card-top">
              <div
                className="rev-avatar"
                style={{ background: r.avatarColor }}
              >
                {r.avatar}
              </div>
              <div className="rev-meta">
                <div className="rev-name">{r.name}</div>
                <div className="rev-location">📍 {r.location}</div>
              </div>
              <div className="rev-quote-icon">"</div>
            </div>

            <div className="rev-stars">
              {[1,2,3,4,5].map((s) => (
                <span key={s} style={{ color: s <= r.rating ? '#e8c94a' : '#d8d0c4' }}>★</span>
              ))}
            </div>

            <p className="rev-text">{r.text}</p>

            <div className="rev-product-tag">
              Verified purchase · {r.product}
            </div>

            <div className="rev-date">{r.date}</div>
          </div>
        ))}
      </div>

      {/* Overall stats */}
      <div className="rev-stats">
        <div className="rev-stat">
          <div className="rev-stat-num">4.9</div>
          <div className="rev-stat-stars">★★★★★</div>
          <div className="rev-stat-label">Average Rating</div>
        </div>
        <div className="rev-stat-div" />
        <div className="rev-stat">
          <div className="rev-stat-num">500+</div>
          <div className="rev-stat-label">Verified Reviews</div>
        </div>
        <div className="rev-stat-div" />
        <div className="rev-stat">
          <div className="rev-stat-num">97%</div>
          <div className="rev-stat-label">Would Recommend</div>
        </div>
      </div>
    </section>
  );
}
