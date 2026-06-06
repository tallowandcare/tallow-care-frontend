import { useState, useRef, useEffect } from 'react';

const QUICK_SUGGESTIONS = [
  '💡 Daily care tips for my dog',
  '🐾 Recommend a paw balm',
  '🌿 Best organic products',
  '💊 Vaccination schedule',
];

export default function AISection() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi there! 🐾 I'm Tallow AI, your pet care assistant. Ask me anything about your pet's wellness, products, or care routines!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    // Simulate AI response (preserving existing AI functionality hook point)
    setTimeout(() => {
      const replies = [
        "Great question! For your pet's care, I'd recommend starting with our Organic Tallow Paw Balm — it's perfect for sensitive skin and paw protection. 🐾",
        "Based on your pet's profile, I suggest adding more daily exercise and considering our Calming Mist for stress relief. 🌿",
        "Our bestselling Tallow & Neem Dog Soap would be perfect for that! It soothes dry and itchy skin naturally. 🧼",
        "For vaccinations, I recommend checking with your local vet. I can help you book an appointment through our Services section! 📅",
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setLoading(false);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Floating chat panel ── */}
      <div className={`tc-chat-panel${isOpen ? ' tc-chat-panel--open' : ''}`}>
        {/* Header */}
        <div className="tc-chat-header">
          <div className="tc-chat-header-info">
            <div className="tc-chat-avatar">🤖</div>
            <div>
              <div className="tc-chat-title">Tallow AI</div>
              <div className="tc-chat-status">
                <span className="tc-chat-online-dot" />
                Online · Pet Care Expert
              </div>
            </div>
          </div>
          <button
            className="tc-chat-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="tc-chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`tc-chat-msg tc-chat-msg--${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="tc-chat-msg-avatar">🤖</div>
              )}
              <div className="tc-chat-msg-bubble">{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="tc-chat-msg tc-chat-msg--assistant">
              <div className="tc-chat-msg-avatar">🤖</div>
              <div className="tc-chat-msg-bubble tc-chat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick suggestions */}
        {messages.length <= 1 && (
          <div className="tc-chat-suggestions">
            {QUICK_SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                className="tc-chat-suggestion-btn"
                onClick={() => sendMessage(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="tc-chat-input-row">
          <input
            ref={inputRef}
            className="tc-chat-input"
            placeholder="Ask about your pet's care..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="tc-chat-send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            aria-label="Send"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Floating trigger button ── */}
      <button
        className={`tc-chat-fab${isOpen ? ' tc-chat-fab--active' : ''}`}
        onClick={() => setIsOpen(o => !o)}
        aria-label="Open AI chat"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="tc-chat-fab-label">AI Chat</span>
          </>
        )}
        <span className="tc-chat-fab-dot" />
      </button>
    </>
  );
}
