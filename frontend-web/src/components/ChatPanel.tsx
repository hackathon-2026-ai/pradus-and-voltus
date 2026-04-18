import { type FC, useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

interface Obstacle {
  x: number;
  width: number;
  height: number;
}

const DINO_VIEW_WIDTH = 300;
const DINO_VIEW_HEIGHT = 96;
const DINO_GROUND_Y = 76;
const DINO_RUNNER_X = 26;
const DINO_RUNNER_W = 18;
const DINO_RUNNER_H = 22;
const DINO_GRAVITY = 1050;
const DINO_JUMP_VELOCITY = 390;

const ThinkingMiniGame: FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const scoreAccumulatorRef = useRef<number>(0);
  const scoreEmitAccumulatorRef = useRef<number>(0);
  const runnerLiftRef = useRef<number>(0);
  const runnerVelocityRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0.8);
  const obstacleSpeedRef = useRef<number>(170);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const crashedRef = useRef<boolean>(false);

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [crashed, setCrashed] = useState(false);

  const resetGame = () => {
    scoreAccumulatorRef.current = 0;
    scoreEmitAccumulatorRef.current = 0;
    runnerLiftRef.current = 0;
    runnerVelocityRef.current = 0;
    spawnTimerRef.current = 0.75;
    obstacleSpeedRef.current = 170;
    obstaclesRef.current = [];
    crashedRef.current = false;
    setScore(0);
    setCrashed(false);
  };

  const jump = () => {
    if (!active) return;

    if (crashedRef.current) {
      resetGame();
      return;
    }

    if (runnerLiftRef.current <= 0.5) {
      runnerVelocityRef.current = DINO_JUMP_VELOCITY;
    }
  };

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
        event.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    canvas.width = DINO_VIEW_WIDTH * dpr;
    canvas.height = DINO_VIEW_HEIGHT * dpr;
    canvas.style.width = `${DINO_VIEW_WIDTH}px`;
    canvas.style.height = `${DINO_VIEW_HEIGHT}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    resetGame();
    lastFrameTimeRef.current = 0;

    const draw = () => {
      ctx.clearRect(0, 0, DINO_VIEW_WIDTH, DINO_VIEW_HEIGHT);

      // Subtle game backdrop tied to the chat palette.
      const bgGradient = ctx.createLinearGradient(0, 0, 0, DINO_VIEW_HEIGHT);
      bgGradient.addColorStop(0, 'rgba(34, 211, 238, 0.08)');
      bgGradient.addColorStop(1, 'rgba(10, 14, 26, 0)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, DINO_VIEW_WIDTH, DINO_VIEW_HEIGHT);

      // Ground line and dashes.
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, DINO_GROUND_Y + 0.5);
      ctx.lineTo(DINO_VIEW_WIDTH, DINO_GROUND_Y + 0.5);
      ctx.stroke();

      ctx.fillStyle = 'rgba(100, 116, 139, 0.7)';
      for (let i = 0; i < DINO_VIEW_WIDTH; i += 22) {
        const dashOffset = (scoreAccumulatorRef.current * 2) % 22;
        ctx.fillRect(i - dashOffset, DINO_GROUND_Y + 6, 10, 2);
      }

      // Obstacles.
      ctx.fillStyle = 'rgba(244, 63, 94, 0.9)';
      obstaclesRef.current.forEach((obstacle) => {
        const y = DINO_GROUND_Y - obstacle.height;
        ctx.fillRect(obstacle.x, y, obstacle.width, obstacle.height);
      });

      // Runner.
      const runnerY = DINO_GROUND_Y - DINO_RUNNER_H - runnerLiftRef.current;
      ctx.fillStyle = crashedRef.current ? 'rgba(248, 113, 113, 0.95)' : 'rgba(34, 211, 238, 0.95)';
      ctx.fillRect(DINO_RUNNER_X, runnerY, DINO_RUNNER_W, DINO_RUNNER_H);

      // Eye.
      ctx.fillStyle = 'rgba(10, 14, 26, 0.95)';
      ctx.fillRect(DINO_RUNNER_X + 12, runnerY + 5, 2, 2);
    };

    const tick = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const dt = Math.min(0.033, (timestamp - lastFrameTimeRef.current) / 1000);
      lastFrameTimeRef.current = timestamp;

      if (!crashedRef.current) {
        obstacleSpeedRef.current = Math.min(320, 170 + scoreAccumulatorRef.current * 1.8);

        runnerVelocityRef.current -= DINO_GRAVITY * dt;
        runnerLiftRef.current = Math.max(0, runnerLiftRef.current + runnerVelocityRef.current * dt);
        if (runnerLiftRef.current === 0 && runnerVelocityRef.current < 0) {
          runnerVelocityRef.current = 0;
        }

        spawnTimerRef.current -= dt;
        if (spawnTimerRef.current <= 0) {
          const heights = [16, 22, 28, 34];
          const widths = [10, 12, 14, 18];
          const randomHeight = heights[Math.floor(Math.random() * heights.length)];
          const randomWidth = widths[Math.floor(Math.random() * widths.length)];
          obstaclesRef.current.push({
            x: DINO_VIEW_WIDTH + 12,
            width: randomWidth,
            height: randomHeight,
          });
          spawnTimerRef.current = 0.7 + Math.random() * 0.9;
        }

        obstaclesRef.current = obstaclesRef.current
          .map(obstacle => ({
            ...obstacle,
            x: obstacle.x - obstacleSpeedRef.current * dt,
          }))
          .filter(obstacle => obstacle.x + obstacle.width > -4);

        const runnerTop = DINO_GROUND_Y - DINO_RUNNER_H - runnerLiftRef.current;
        const runnerBottom = runnerTop + DINO_RUNNER_H;
        const runnerLeft = DINO_RUNNER_X;
        const runnerRight = DINO_RUNNER_X + DINO_RUNNER_W;

        const collided = obstaclesRef.current.some((obstacle) => {
          const obstacleTop = DINO_GROUND_Y - obstacle.height;
          const obstacleBottom = DINO_GROUND_Y;
          const obstacleLeft = obstacle.x;
          const obstacleRight = obstacle.x + obstacle.width;

          return (
            runnerLeft < obstacleRight &&
            runnerRight > obstacleLeft &&
            runnerTop < obstacleBottom &&
            runnerBottom > obstacleTop
          );
        });

        if (collided) {
          crashedRef.current = true;
          setCrashed(true);
          setBestScore((prev) => Math.max(prev, Math.floor(scoreAccumulatorRef.current)));
        } else {
          scoreAccumulatorRef.current += dt * 12;
          scoreEmitAccumulatorRef.current += dt;
          if (scoreEmitAccumulatorRef.current >= 0.12) {
            scoreEmitAccumulatorRef.current = 0;
            setScore(Math.floor(scoreAccumulatorRef.current));
          }
        }
      }

      draw();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="chat-dino" role="status" aria-live="polite" onMouseDown={jump}>
      <div className="chat-dino-head">
        <span className="chat-dino-title">Mini game while Voltuś thinks</span>
        <span className="chat-dino-score">Score {score} | Best {bestScore}</span>
      </div>
      <canvas ref={canvasRef} className="chat-dino-canvas" />
      <div className="chat-dino-hint">
        Press Space / Arrow Up / W or click to jump{crashed ? ' | Crashed - jump to retry' : ''}
      </div>
    </div>
  );
};

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL as unknown;
const API_BASE = (typeof RAW_API_BASE === 'string' && RAW_API_BASE.trim() ? RAW_API_BASE : '/api').replace(/\/$/, '');

async function readBackendPayload(response: Response): Promise<unknown> {
  const rawText = await response.text();
  if (!rawText) return null;

  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    const trimmed = rawText.trimStart();
    const looksLikeHtml = trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.startsWith('<');
    const isViteIndex = trimmed.includes('/@vite/client');
    const isWerkzeugDebugger = trimmed.includes('Werkzeug Debugger') || trimmed.includes('__debugger__=yes');

    let message = `Backend returned non-JSON response: ${trimmed.slice(0, 200)}`;
    if (looksLikeHtml && isViteIndex) {
      message = 'Vite returned index.html for an /api request (proxy not applied). Restart the Vite dev server so the /api proxy from vite.config.ts is active.';
    } else if (looksLikeHtml && isWerkzeugDebugger) {
      message = 'Backend returned a Flask/Werkzeug error page instead of JSON. Check the backend logs/terminal for the exception and fix it.';
    } else if (looksLikeHtml) {
      message = 'Backend returned HTML instead of JSON. If this is Vite index.html, restart Vite; if it is an error page, check backend logs.';
    }

    return {
      status: 'error',
      message,
    };
  }
}

function getAssistantText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return 'No response data from backend.';
  }

  const data = payload as Record<string, unknown>;
  const status = data.status;
  if (status === 'error') {
    const message = data.message;
    return typeof message === 'string' ? message : 'Backend returned an error.';
  }

  const ui = data.ui_components as Record<string, unknown> | undefined;
  const aiPanel = ui?.ai_copilot_panel as Record<string, unknown> | undefined;

  const parts: string[] = [];

  const summary = aiPanel?.executive_summary;
  if (typeof summary === 'string' && summary.trim()) parts.push(summary.trim());

  const dsrAction = aiPanel?.dsr_action;
  if (typeof dsrAction === 'string' && dsrAction.trim()) parts.push(dsrAction.trim());

  const explainableAi = ui?.explainable_ai;
  if (typeof explainableAi === 'string' && explainableAi.trim()) parts.push(explainableAi.trim());

  const pradusAlert = ui?.pradus_alert;
  if (typeof pradusAlert === 'string' && pradusAlert.trim()) parts.push(pradusAlert.trim());

  if (parts.length > 0) return parts.join('\n\n');

  return 'Received a response, but no readable assistant text was found.';
}

const ChatPanel: FC<ChatPanelProps> = ({ open, onClose }) => {
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (open && event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat/voltus?message=${encodeURIComponent(text)}`, {
        headers: {
          Accept: 'application/json',
        },
      });

      const payload = await readBackendPayload(response);
      const assistantText = getAssistantText(payload);

      if (!response.ok) {
        const fallback = `Request failed with status ${response.status}`;
        setMessages(prev => [...prev, { role: 'assistant', text: assistantText || fallback }]);
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', text: assistantText }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error while contacting backend.';
      setMessages(prev => [...prev, { role: 'assistant', text: `Connection error: ${message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasActivity = messages.length > 0 || isLoading;

  return (
    <div className={`chat-panel${open ? ' chat-panel-open' : ''}${expanded ? ' chat-panel-expanded' : ''}`}>
      <div className="chat-panel-inner">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className={`chat-avatar ${hasActivity ? 'has-video' : ''}`}></div>
            <div>
              <div className="chat-title">Voltuś AI</div>
              <div className="chat-status">
                <span className="chat-status-dot"></span>
                {isLoading ? 'Thinking...' : 'Ready'}
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

        {/* The Animating Video */}
        <div className={`chat-ziutek-absolute ${hasActivity ? 'in-header' : ''}`}>
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
          {!hasActivity && (
            <div className="chat-ziutek-placeholder" style={{ height: '132px' }} />
          )}

          {messages.length === 0 && (
            <div className="chat-welcome">
              <h3>Voltuś AI</h3>
              <p>Ask me anything about energy data, facilities, or regions on the map.</p>
              <div className="chat-suggestions">
                <button className="chat-suggestion" onClick={() => { setInputValue("What's the total energy capacity?"); }}>What's the total energy capacity?</button>
                <button className="chat-suggestion" onClick={() => { setInputValue("Compare wind vs solar output"); }}>Compare wind vs solar output</button>
                <button className="chat-suggestion" onClick={() => { setInputValue("Which province uses the most energy?"); }}>Which province uses the most energy?</button>
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
            <div className="chat-thinking-game-wrap">
              <ThinkingMiniGame active={isLoading} />
            </div>
          )}

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
              placeholder="Ask about energy data..."
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
            Powered by Voltuś AI
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
