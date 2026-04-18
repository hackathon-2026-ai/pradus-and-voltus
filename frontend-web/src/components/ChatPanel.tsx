import { type FC, useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

const ChatPanel: FC<ChatPanelProps> = ({ open, onClose: _onClose }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    } else {
      setExpanded(false);
    }
  }, [open]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const fetchVoltusResponse = async (prompt: string) => {
    const url = `/api/chat/voltus?message=${encodeURIComponent(prompt)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Serwer zwrócił błąd: ${response.status}`);
    }

    const data = await response.json();

    if (typeof data === 'string') {
      return data;
    }

    if (data?.status === 'success') {
      const summary = data.ui_components?.ai_copilot_panel?.executive_summary ?? '';
      const dsr = data.ui_components?.ai_copilot_panel?.dsr_action ?? '';
      const explain = data.ui_components?.explainable_ai ?? '';
      return [summary, dsr, explain].filter(Boolean).join('\n\n');
    }

    if (data?.message) {
      return `${data.status ?? 'error'}: ${data.message}`;
    }

    return JSON.stringify(data, null, 2);
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await fetchVoltusResponse(text);
      setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      setMessages(prev => [...prev, { role: 'assistant', text: `Błąd: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasResponses = messages.some(m => m.role === 'assistant');

  return (
    <div className={`chat-panel${open ? ' chat-panel-open' : ''}${expanded ? ' chat-panel-expanded' : ''}`}>
      <div className="chat-panel-inner">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className={`chat-avatar ${hasResponses ? 'has-video' : ''}`}></div>
            <div>
              <div className="chat-title">Voltuś AI</div>
              <div className="chat-status">
                <span className="chat-status-dot"></span>
                {isLoading ? t('chat.thinking') : t('chat.ready')}
              </div>
            </div>
          </div>
          <button className="chat-close" onClick={() => setExpanded(e => !e)} aria-label={expanded ? t('chat.shrink') : t('chat.expand')}>
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

        {/* The Animating Video */}
        <div className={`chat-ziutek-absolute ${hasResponses ? 'in-header' : ''}`}>
          <video
            className="chat-ziutek-video"
            src="/ziutek/output1.webm"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>

        {/* Messages area */}
        <div className="chat-messages">
          {/* Ziutek animation placeholder */}
          {!hasResponses && (
            <div className="chat-ziutek-placeholder" style={{ height: '132px' }} />
          )}

          {messages.length === 0 && (
            <div className="chat-welcome">
              <h3>Voltuś AI</h3>
              <p>{t('chat.welcome')}</p>
              <div className="chat-suggestions">
                <button className="chat-suggestion" onClick={() => { setInputValue(t('chat.suggestion1')); }}>{t('chat.suggestion1')}</button>
                <button className="chat-suggestion" onClick={() => { setInputValue(t('chat.suggestion2')); }}>{t('chat.suggestion2')}</button>
                <button className="chat-suggestion" onClick={() => { setInputValue(t('chat.suggestion3')); }}>{t('chat.suggestion3')}</button>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`chat-message chat-message-${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="chat-msg-avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C6.48 2 2 5.58 2 10c0 2.24 1.12 4.27 2.94 5.72L4 20l4.47-2.24C9.6 17.92 10.78 18 12 18c5.52 0 10-3.58 10-8S17.52 2 12 2z"/>
                  </svg>
                </div>
              )}
              <div className="chat-msg-bubble">{msg.text}</div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-message chat-message-assistant">
              <div className="chat-msg-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 5.58 2 10c0 2.24 1.12 4.27 2.94 5.72L4 20l4.47-2.24C9.6 17.92 10.78 18 12 18c5.52 0 10-3.58 10-8S17.52 2 12 2z"/>
                </svg>
              </div>
              <div className="chat-msg-bubble chat-typing">
                <span className="chat-typing-dot"></span>
                <span className="chat-typing-dot"></span>
                <span className="chat-typing-dot"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder={t('chat.placeholder')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) {
                  handleSend();
                }
              }}
            />
            <button
              className={`chat-send${inputValue.trim() ? ' chat-send-active' : ''}`}
              disabled={!inputValue.trim()}
              onClick={handleSend}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <div className="chat-input-hint">
            {t('chat.poweredBy')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
