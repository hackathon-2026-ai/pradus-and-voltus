import { type FC, useState, useRef, useEffect } from 'react';

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

const ChatPanel: FC<ChatPanelProps> = ({ open, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    } else {
      setExpanded(false);
    }
  }, [open]);

  return (
    <div className={`chat-panel${open ? ' chat-panel-open' : ''}${expanded ? ' chat-panel-expanded' : ''}`}>
      <div className="chat-panel-inner">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 5.58 2 10c0 2.24 1.12 4.27 2.94 5.72L4 20l4.47-2.24C9.6 17.92 10.78 18 12 18c5.52 0 10-3.58 10-8S17.52 2 12 2z"/>
              </svg>
            </div>
            <div>
              <div className="chat-title">Voltuś AI</div>
              <div className="chat-status">
                <span className="chat-status-dot"></span>
                Ready
              </div>
            </div>
          </div>
          <button className="chat-close" onClick={() => setExpanded(e => !e)} aria-label={expanded ? 'Shrink chat' : 'Expand chat'}>
            {expanded ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20"/>
                <polyline points="20 10 14 10 14 4"/>
                <line x1="14" y1="10" x2="21" y2="3"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"/>
                <polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            )}
          </button>
        </div>

        {/* Messages area */}
        <div className="chat-messages">
          <div className="chat-welcome">
            <div className="chat-welcome-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 5.58 2 10c0 2.24 1.12 4.27 2.94 5.72L4 20l4.47-2.24C9.6 17.92 10.78 18 12 18c5.52 0 10-3.58 10-8S17.52 2 12 2z"/>
                <circle cx="8" cy="10" r="1" fill="currentColor" stroke="none"/>
                <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none"/>
                <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <h3>Voltuś AI</h3>
            <p>Ask me anything about energy data, facilities, or regions on the map.</p>
            <div className="chat-suggestions">
              <button className="chat-suggestion">What's the total energy capacity?</button>
              <button className="chat-suggestion">Compare wind vs solar output</button>
              <button className="chat-suggestion">Which province uses the most energy?</button>
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Ask about energy data..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) {
                  setInputValue('');
                }
              }}
            />
            <button
              className={`chat-send${inputValue.trim() ? ' chat-send-active' : ''}`}
              disabled={!inputValue.trim()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <div className="chat-input-hint">
            AI features coming soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
