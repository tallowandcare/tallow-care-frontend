import { useState, useEffect } from 'react';
import DashNavbar from '../components/dashboard/DashNavbar';
import DashFooter from '../components/dashboard/DashFooter';
import '../styles/dashboard.css';
import '../styles/reviews.css';

/* ── Static seed data ── */
const SEED_REVIEWS = [
  {
    id: 1,
    name: 'Priya Mehta',
    initials: 'PM',
    avatarColor: '#e8c94a',
    rating: 5,
    title: "My dog's skin completely transformed!",
    text: "After just two weeks of using the Tallow Healing Balm, Bruno's dry patches vanished. I've tried countless products before but nothing worked this well. Highly recommend to any pet parent.",
    date: 'May 18, 2026',
    product: 'Healing Balm — Sensitive',
    helpful: 24,
  },
  {
    id: 2,
    name: 'Arjun Sharma',
    initials: 'AS',
    avatarColor: '#8aaa7a',
    rating: 5,
    title: 'Finally a brand that actually cares',
    text: 'The dog soap lathers beautifully and the smell is so natural. My golden retriever stopped scratching after the first bath. The packaging is eco-friendly which I appreciate too.',
    date: 'May 10, 2026',
    product: 'Dog Soap — Oat & Calendula',
    helpful: 18,
  },
  {
    id: 3,
    name: 'Neha Kapoor',
    initials: 'NK',
    avatarColor: '#c8a97a',
    rating: 4,
    title: 'Great for sensitive cats',
    text: 'My Persian cat has very delicate skin and most products irritate her. This cat soap is gentle and she seemed much calmer after her bath. Minor complaint: wish the bottle were bigger for the price.',
    date: 'Apr 29, 2026',
    product: 'Cat Soap — Chamomile',
    helpful: 12,
  },
  {
    id: 4,
    name: 'Ravi Patel',
    initials: 'RP',
    avatarColor: '#7a9ec8',
    rating: 5,
    title: 'Game changer for rescue dogs',
    text: 'I foster rescue dogs and many arrive with skin issues. The healing balm has become a staple in my home. Within days the redness reduces and coats look shinier. Ordering in bulk now!',
    date: 'Apr 22, 2026',
    product: 'Healing Balm — Extra Strength',
    helpful: 31,
  },
  {
    id: 5,
    name: 'Sunita Verma',
    initials: 'SV',
    avatarColor: '#c87a9e',
    rating: 3,
    title: 'Good product, slow shipping',
    text: 'The balm itself works well and my labrador loves bath time now. My only gripe is the shipping took over 10 days. Customer service was responsive when I reached out though.',
    date: 'Apr 15, 2026',
    product: 'Dog Soap — Lavender',
    helpful: 7,
  },
  {
    id: 6,
    name: 'Vikram Singh',
    initials: 'VS',
    avatarColor: '#9e7ac8',
    rating: 4,
    title: 'Impressive ingredient quality',
    text: "I'm very particular about what goes on my pets. No harmful chemicals, fully natural ingredients, and it actually delivers results. The tallow base is exactly what I was looking for.",
    date: 'Mar 30, 2026',
    product: 'Cat Soap — Unscented',
    helpful: 14,
  },
];

const RATING_DIST = { 5: 68, 4: 18, 3: 8, 2: 4, 1: 2 };
const AVG_RATING = 4.5;
const TOTAL_REVIEWS = 512;

/* ── Helpers ── */
function StarRating({ value, onChange, size = 24 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="rv-star-input" aria-label="Select rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`rv-star-btn${(hovered || value) >= s ? ' rv-star-btn--on' : ''}`}
          style={{ fontSize: size }}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          onClick={() => onChange && onChange(s)}
          aria-label={`${s} star${s > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, onHelpful }) {
  const [helped, setHelped] = useState(false);
  return (
    <div className="rv-card">
      <div className="rv-card-header">
        <div className="rv-avatar" style={{ background: review.avatarColor }}>
          {review.initials}
        </div>
        <div className="rv-card-meta">
          <div className="rv-card-name">{review.name}</div>
          <div className="rv-card-product">Verified · {review.product}</div>
        </div>
        <div className="rv-card-date">{review.date}</div>
      </div>

      <StarRating value={review.rating} size={18} />

      <p className="rv-card-title">{review.title}</p>
      <p className="rv-card-text">{review.text}</p>

      <div className="rv-card-footer">
        <button
          className={`rv-helpful-btn${helped ? ' rv-helpful-btn--active' : ''}`}
          onClick={() => {
            if (!helped) {
              setHelped(true);
              onHelpful(review.id);
            }
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          Helpful ({review.helpful})
        </button>
      </div>
    </div>
  );
}

export default function DashboardReviews() {
  const [cartCount, setCartCount] = useState(3);
  const [reviews, setReviews] = useState(SEED_REVIEWS);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [form, setForm] = useState({ rating: 0, title: '', text: '' });
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleHelpful = (id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r))
    );
  };

  const handleSubmit = () => {
    if (form.rating === 0) { setFormError('Please select a star rating.'); return; }
    if (!form.text.trim()) { setFormError('Please write your review.'); return; }
    setFormError('');
    const avatarColors = ['#e8c94a', '#8aaa7a', '#c8a97a', '#7a9ec8', '#c87a9e'];
    const newReview = {
      id: Date.now(),
      name: 'You',
      initials: 'YO',
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
      rating: form.rating,
      title: form.title || 'My Review',
      text: form.text,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      product: 'Tallow & Care Product',
      helpful: 0,
    };
    setReviews((prev) => [newReview, ...prev]);
    setForm({ rating: 0, title: '', text: '' });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const filtered = reviews
    .filter((r) => filter === 'all' || r.rating === Number(filter))
    .sort((a, b) => {
      if (sort === 'newest') return b.id - a.id;
      if (sort === 'highest') return b.rating - a.rating;
      if (sort === 'helpful') return b.helpful - a.helpful;
      return 0;
    });

  return (
    <div className="dash-root">
      <DashNavbar cartCount={cartCount} onCartClick={() => {}} />

      <div className={`rv-page${animateIn ? ' rv-page--visible' : ''}`}>

        {/* ── Page Header ── */}
        <div className="rv-page-header">
          <div className="rv-page-header-inner">
            <div className="rv-page-eyebrow">❤️ Community</div>
            <h1 className="rv-page-title">User Reviews</h1>
            <p className="rv-page-sub">
              Real stories from real pet parents — see why thousands of pets live healthier lives with Tallow &amp; Care.
            </p>
          </div>
        </div>

        <div className="rv-main-layout">

          {/* ── LEFT COLUMN: Summary + Form ── */}
          <aside className="rv-sidebar">

            {/* Summary Card */}
            <div className="rv-summary-card">
              <div className="rv-summary-top">
                <div className="rv-summary-avg">{AVG_RATING}</div>
                <div>
                  <StarRating value={Math.round(AVG_RATING)} size={22} />
                  <div className="rv-summary-count">{TOTAL_REVIEWS.toLocaleString()} verified reviews</div>
                </div>
              </div>
              <div className="rv-rating-bars">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    className={`rv-bar-row${filter === String(star) ? ' rv-bar-row--active' : ''}`}
                    onClick={() => setFilter(filter === String(star) ? 'all' : String(star))}
                    aria-label={`Filter by ${star} stars`}
                  >
                    <span className="rv-bar-label">{star}★</span>
                    <div className="rv-bar-track">
                      <div
                        className="rv-bar-fill"
                        style={{ width: `${RATING_DIST[star]}%` }}
                      />
                    </div>
                    <span className="rv-bar-pct">{RATING_DIST[star]}%</span>
                  </button>
                ))}
              </div>
              <div className="rv-summary-stats">
                <div className="rv-summary-stat">
                  <div className="rv-summary-stat-num">97%</div>
                  <div className="rv-summary-stat-label">Would Recommend</div>
                </div>
                <div className="rv-summary-stat-div" />
                <div className="rv-summary-stat">
                  <div className="rv-summary-stat-num">4,200+</div>
                  <div className="rv-summary-stat-label">Happy Pets</div>
                </div>
              </div>
            </div>

            {/* Write Review Form */}
            <div className="rv-form-card">
              <h3 className="rv-form-title">Write a Review</h3>
              <p className="rv-form-sub">Share your experience with the community</p>

              <div className="rv-form-group">
                <label className="rv-form-label">Your Rating</label>
                <StarRating
                  value={form.rating}
                  onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
                  size={30}
                />
              </div>

              <div className="rv-form-group">
                <label className="rv-form-label">Review Title <span className="rv-form-optional">(optional)</span></label>
                <input
                  className="rv-form-input"
                  type="text"
                  placeholder="Summarise your experience"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  maxLength={80}
                />
              </div>

              <div className="rv-form-group">
                <label className="rv-form-label">Your Review</label>
                <textarea
                  className="rv-form-textarea"
                  placeholder="Tell us what you think about the product…"
                  rows={4}
                  value={form.text}
                  onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                  maxLength={500}
                />
                <div className="rv-char-count">{form.text.length}/500</div>
              </div>

              {formError && <div className="rv-form-error">{formError}</div>}
              {submitted && <div className="rv-form-success">✓ Review submitted — thank you!</div>}

              <button className="rv-submit-btn" onClick={handleSubmit}>
                Submit Review
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </aside>

          {/* ── RIGHT COLUMN: Filter bar + Cards ── */}
          <main className="rv-content">

            {/* Filter / Sort bar */}
            <div className="rv-controls">
              <div className="rv-filter-pills">
                {['all', '5', '4', '3', '2', '1'].map((v) => (
                  <button
                    key={v}
                    className={`rv-pill${filter === v ? ' rv-pill--active' : ''}`}
                    onClick={() => setFilter(v)}
                  >
                    {v === 'all' ? 'All Reviews' : `${v}★`}
                  </button>
                ))}
              </div>

              <div className="rv-sort-wrap">
                <label className="rv-sort-label">Sort:</label>
                <select
                  className="rv-sort-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="highest">Highest Rated</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
            </div>

            {/* Count */}
            <div className="rv-result-count">
              Showing {filtered.length} review{filtered.length !== 1 ? 's' : ''}
              {filter !== 'all' ? ` for ${filter}★` : ''}
            </div>

            {/* Cards */}
            <div className="rv-cards-list">
              {filtered.length === 0 ? (
                <div className="rv-empty">
                  <div className="rv-empty-icon">😿</div>
                  <div className="rv-empty-text">No reviews found for this filter.</div>
                </div>
              ) : (
                filtered.map((r) => (
                  <ReviewCard key={r.id} review={r} onHelpful={handleHelpful} />
                ))
              )}
            </div>
          </main>
        </div>
      </div>

      <DashFooter />
    </div>
  );
}
