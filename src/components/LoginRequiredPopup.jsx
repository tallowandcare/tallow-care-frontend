import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * LoginRequiredPopup
 * ──────────────────
 * A bottom-right toast-style popup shown when a guest tries to add to cart.
 * Matches the site's existing design language (sage green / dark cream palette).
 *
 * Props:
 *   visible  – boolean: whether the popup is shown
 *   onClose  – callback: fired when popup closes (auto or manual)
 */
export default function LoginRequiredPopup({ visible, onClose }) {
  const navigate   = useNavigate();
  const timerRef   = useRef(null);

  // Auto-dismiss after 4 s whenever it becomes visible
  useEffect(() => {
    if (visible) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onClose?.();
      }, 4000);
    }
    return () => clearTimeout(timerRef.current);
  }, [visible, onClose]);

  const handleLoginNow = () => {
    onClose?.();
    navigate('/login');
  };

  return (
    <>
      <style>{`
        /* ── Login Required Popup ───────────────────────────── */
        .lrp-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9998;
          pointer-events: none;
        }
        .lrp-backdrop--visible {
          pointer-events: auto;
        }

        .lrp-popup {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          width: 340px;
          max-width: calc(100vw - 40px);

          background: #1e3520;
          border: 1px solid rgba(138, 170, 122, 0.25);
          border-radius: 20px;
          padding: 20px 22px 18px;
          box-shadow:
            0 24px 64px rgba(0, 0, 0, 0.35),
            0 8px 24px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);

          /* Hidden state */
          opacity: 0;
          transform: translateY(20px) scale(0.96);
          pointer-events: none;
          transition:
            opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lrp-popup--visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        /* Progress bar that drains over 4 s */
        .lrp-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          border-radius: 0 0 20px 20px;
          background: linear-gradient(90deg, #4a7c3f, #8aaa7a);
          width: 100%;
          transform-origin: left;
          transform: scaleX(1);
          transition: none;
        }
        .lrp-popup--visible .lrp-progress {
          transform: scaleX(0);
          transition: transform 4s linear;
        }

        /* Icon pill */
        .lrp-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(138, 170, 122, 0.15);
          border: 1px solid rgba(138, 170, 122, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .lrp-icon-wrap svg {
          width: 20px;
          height: 20px;
          color: #8aaa7a;
        }

        /* Header row */
        .lrp-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
        }
        .lrp-text-block {
          flex: 1;
          min-width: 0;
        }
        .lrp-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.3;
          margin-bottom: 4px;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.01em;
        }
        .lrp-body {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.55;
          font-family: 'Inter', sans-serif;
        }

        /* Close button */
        .lrp-close {
          flex-shrink: 0;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          border: none;
          background: rgba(255, 255, 255, 0.07);
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
          font-size: 14px;
          line-height: 1;
          align-self: flex-start;
        }
        .lrp-close:hover {
          background: rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.75);
        }

        /* Action row */
        .lrp-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lrp-btn-primary {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 18px;
          border-radius: 12px;
          border: none;
          background: #8aaa7a;
          color: #fff;
          font-size: 0.82rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: background 0.2s, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(138, 170, 122, 0.35);
          letter-spacing: 0.01em;
        }
        .lrp-btn-primary:hover {
          background: #4a7c3f;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(74, 124, 63, 0.4);
        }
        .lrp-btn-primary svg {
          width: 13px;
          height: 13px;
          transition: transform 0.2s;
        }
        .lrp-btn-primary:hover svg {
          transform: translateX(3px);
        }
        .lrp-btn-secondary {
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: transparent;
          color: rgba(255, 255, 255, 0.55);
          font-size: 0.82rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .lrp-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.07);
          color: rgba(255, 255, 255, 0.8);
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* Mobile */
        @media (max-width: 480px) {
          .lrp-popup {
            bottom: 16px;
            right: 16px;
            left: 16px;
            width: auto;
            max-width: none;
          }
        }
      `}</style>

      <div
        className={`lrp-backdrop${visible ? ' lrp-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`lrp-popup${visible ? ' lrp-popup--visible' : ''}`}
        role="alert"
        aria-live="polite"
      >
        {/* Auto-dismiss progress bar */}
        <div className="lrp-progress" />

        {/* Header */}
        <div className="lrp-header">
          <div className="lrp-icon-wrap">
            {/* Lock icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <div className="lrp-text-block">
            <div className="lrp-title">Login required</div>
            <div className="lrp-body">
              Login / Signup karke hi add to cart kar sakte ho 🛒
            </div>
          </div>

          <button
            className="lrp-close"
            onClick={onClose}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>

        {/* Actions */}
        <div className="lrp-actions">
          <button className="lrp-btn-primary" onClick={handleLoginNow}>
            Login Now
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <button className="lrp-btn-secondary" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </>
  );
}
