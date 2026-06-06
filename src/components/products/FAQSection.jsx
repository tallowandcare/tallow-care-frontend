import { useState } from 'react';
import { FAQS } from '../../data/productsData';

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className={`faq-item${isOpen ? ' faq-item--open' : ''}`}>
      <button className="faq-question" onClick={onToggle}>
        <span>{faq.question}</span>
        <span className="faq-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points={isOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}/>
          </svg>
        </span>
      </button>
      <div className="faq-answer">
        <div className="faq-answer-inner">
          {faq.answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section className="faq-section">
      <div className="faq-eyebrow">Got Questions?</div>
      <h2 className="faq-title">Frequently Asked</h2>
      <p className="faq-sub">
        Everything you need to know about our products and your cat's care.
      </p>

      <div className="faq-list">
        {FAQS.map((faq) => (
          <FAQItem
            key={faq.id}
            faq={faq}
            isOpen={openId === faq.id}
            onToggle={() => toggle(faq.id)}
          />
        ))}
      </div>
    </section>
  );
}
