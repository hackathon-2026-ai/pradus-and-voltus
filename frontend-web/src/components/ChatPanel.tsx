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

type ObstacleVariant = 'warningSign' | 'dangerPlug' | 'faultTower';

interface Obstacle {
  x: number;
  width: number;
  height: number;
  variant: ObstacleVariant;
}

const DINO_VIEW_WIDTH = 300;
const DINO_VIEW_HEIGHT = 96;
const DINO_GROUND_Y = 76;
const DINO_RUNNER_X = 26;
const DINO_RUNNER_HITBOX_W = 16;
const DINO_RUNNER_HITBOX_H = 22;
const DINO_RUNNER_DRAW_W = 30;
const DINO_RUNNER_DRAW_H = 34;
const DINO_GRAVITY = 1050;
const DINO_JUMP_VELOCITY = 390;

function createSvgImage(svgMarkup: string): HTMLImageElement {
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
  return image;
}

const RUNNER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <defs>
    <linearGradient id="voltusBody" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f3f4f6"/>
      <stop offset="1" stop-color="#9ca3af"/>
    </linearGradient>
    <linearGradient id="voltusEdge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#0f172a" stop-opacity="0.18"/>
    </linearGradient>
    <radialGradient id="voltusGlow" cx="30%" cy="20%" r="80%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.6"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Body (Voltuś) -->
  <rect x="8" y="3" width="24" height="34" rx="11" fill="url(#voltusBody)"/>
  <rect x="8" y="3" width="24" height="34" rx="11" fill="url(#voltusEdge)"/>
  <ellipse cx="18" cy="10" rx="11" ry="9" fill="url(#voltusGlow)"/>

  <!-- Pink collar/band -->
  <rect x="8" y="20" width="24" height="6" rx="3" fill="#ec4899"/>
  <rect x="10" y="21.3" width="20" height="3.4" rx="1.7" fill="#f472b6"/>
  <rect x="16" y="19.2" width="8" height="8" rx="3" fill="#111827" fill-opacity="0.55"/>
  <path d="M18 22.4 L20 24.8 L22 22.4" fill="none" stroke="#22d3ee" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Face (bigger, more expressive) -->
  <ellipse cx="16.5" cy="14" rx="4.2" ry="4.6" fill="#f8fafc"/>
  <ellipse cx="25" cy="14" rx="4.2" ry="4.6" fill="#f8fafc"/>
  <ellipse cx="16.9" cy="14.6" rx="2.1" ry="2.3" fill="#111827"/>
  <ellipse cx="25.4" cy="14.6" rx="2.1" ry="2.3" fill="#111827"/>
  <circle cx="17.6" cy="13.9" r="0.7" fill="#ffffff"/>
  <circle cx="26.1" cy="13.9" r="0.7" fill="#ffffff"/>
  <path d="M13.5 10.8 Q16 9.2 18.6 10.6" fill="none" stroke="#6b7280" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M22.8 10.6 Q25.4 9.2 27.8 10.8" fill="none" stroke="#6b7280" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M16 27 Q20 29.5 24 27" fill="none" stroke="#4b5563" stroke-width="1.9" stroke-linecap="round"/>

  <!-- Tiny arms/legs to read like the mascot -->
  <path d="M8.5 24.5 Q5.5 26 7.3 29" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
  <path d="M31.5 24.5 Q34.5 26 32.7 29" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
  <path d="M13 36.2 L12 39 M27 36.2 L28 39" stroke="#6b7280" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

const OBSTACLE_SVG: Record<ObstacleVariant, string> = {
  warningSign: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 34">
      <path d="M13 2 L24 28 H2 Z" fill="#f43f5e" stroke="#fb7185" stroke-width="1.4"/>
      <path d="M13 7 L9.3 16.3 H12.6 L10.8 24.5 L17.4 13.4 H14.2 Z" fill="#fff1f2"/>
      <path d="M13 7 L9.3 16.3 H12.6 L10.8 24.5 L17.4 13.4 H14.2 Z" fill="none" stroke="#fecdd3" stroke-width="0.9"/>
      <rect x="6" y="29" width="14" height="3" rx="1.5" fill="#881337"/>
    </svg>
  `,
  dangerPlug: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36">
      <rect x="6" y="10" width="12" height="18" rx="4" fill="#f43f5e" stroke="#fb7185" stroke-width="1.2"/>
      <rect x="8" y="4" width="3" height="6" rx="1" fill="#fff1f2"/>
      <rect x="13" y="4" width="3" height="6" rx="1" fill="#fff1f2"/>
      <path d="M9 14 L15 20" stroke="#fff1f2" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M15 14 L9 20" stroke="#fff1f2" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M12 12 L9.6 18.5 H12.2 L10.7 25 L15.8 16.2 H13.2 Z" fill="#fee2e2" stroke="#fecdd3" stroke-width="0.8"/>
      <path d="M18.5 11 L20.5 9" stroke="#fee2e2" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M18.6 14.5 L21 14" stroke="#fee2e2" stroke-width="1.4" stroke-linecap="round"/>
      <rect x="7" y="29" width="10" height="3" rx="1.5" fill="#881337"/>
    </svg>
  `,
  faultTower: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40">
      <rect x="9" y="9" width="6" height="26" rx="2" fill="#be123c"/>
      <circle cx="12" cy="8" r="5" fill="#fb7185" fill-opacity="0.35" stroke="#f43f5e" stroke-width="1.6"/>
      <path d="M12 8 L19 5 M12 8 L5 5 M12 8 L12 1" stroke="#fecdd3" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M10 16 L14 16 M10 22 L14 22 M10 28 L14 28" stroke="#fff1f2" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M12 18 V26" stroke="#fff1f2" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="30" r="1.6" fill="#fff1f2"/>
      <rect x="7" y="35" width="10" height="3" rx="1.5" fill="#881337"/>
    </svg>
  `,
};

interface ThinkingMiniGameProps {
  active: boolean;
  paused: boolean;
  countdown: number;
}

const ThinkingMiniGame: FC<ThinkingMiniGameProps> = ({ active, paused, countdown }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const runnerSpriteRef = useRef<HTMLImageElement | null>(null);
  const obstacleSpritesRef = useRef<Partial<Record<ObstacleVariant, HTMLImageElement>>>({});
  const pausedRef = useRef<boolean>(false);
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
  const [spritesReady, setSpritesReady] = useState(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let cancelled = false;
    setSpritesReady(false);

    const runner = createSvgImage(RUNNER_SVG);
    const obstacles: Record<ObstacleVariant, HTMLImageElement> = {
      warningSign: createSvgImage(OBSTACLE_SVG.warningSign),
      dangerPlug: createSvgImage(OBSTACLE_SVG.dangerPlug),
      faultTower: createSvgImage(OBSTACLE_SVG.faultTower),
    };

    runnerSpriteRef.current = runner;
    obstacleSpritesRef.current = obstacles;

    const images = [runner, ...Object.values(obstacles)];

    const waitFor = (img: HTMLImageElement) => {
      if (img.complete) return Promise.resolve();

      if (typeof img.decode === 'function') {
        return img.decode().catch(() => undefined);
      }

      return new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });
    };

    Promise.all(images.map(waitFor)).then(() => {
      if (!cancelled) setSpritesReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

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
    if (pausedRef.current) return;

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
    if (!canvas || !active || !spritesReady) return;

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
      obstaclesRef.current.forEach((obstacle) => {
        const y = DINO_GROUND_Y - obstacle.height;
        ctx.save();
        ctx.shadowColor = 'rgba(244, 63, 94, 0.55)';
        ctx.shadowBlur = 10;

        const obstacleSprite = obstacleSpritesRef.current[obstacle.variant];
        if (obstacleSprite?.complete && obstacleSprite.naturalWidth > 0) {
          ctx.drawImage(obstacleSprite, obstacle.x, y, obstacle.width, obstacle.height);
        } else {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.95)';
          ctx.fillRect(obstacle.x, y, obstacle.width, obstacle.height);
        }

        ctx.restore();
      });

      // Runner (Voltuś-themed sprite).
      const runnerY = DINO_GROUND_Y - DINO_RUNNER_DRAW_H - runnerLiftRef.current;
      const runnerSprite = runnerSpriteRef.current;
      if (runnerSprite?.complete) {
        ctx.save();
        ctx.shadowColor = crashedRef.current ? 'rgba(244, 63, 94, 0.35)' : 'rgba(34, 211, 238, 0.35)';
        ctx.shadowBlur = 10;
        if (crashedRef.current) {
          ctx.globalAlpha = 0.8;
          ctx.filter = 'saturate(0.6)';
        }
        ctx.drawImage(runnerSprite, DINO_RUNNER_X - 5, runnerY, DINO_RUNNER_DRAW_W, DINO_RUNNER_DRAW_H);
        ctx.restore();
      } else {
        ctx.save();
        ctx.shadowColor = crashedRef.current ? 'rgba(244, 63, 94, 0.35)' : 'rgba(34, 211, 238, 0.35)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = crashedRef.current ? 'rgba(248, 113, 113, 0.95)' : 'rgba(226, 232, 240, 0.95)';
        ctx.fillRect(DINO_RUNNER_X, DINO_GROUND_Y - DINO_RUNNER_HITBOX_H - runnerLiftRef.current, DINO_RUNNER_HITBOX_W, DINO_RUNNER_HITBOX_H);
        ctx.restore();
      }
    };

    const tick = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const dt = Math.min(0.033, (timestamp - lastFrameTimeRef.current) / 1000);
      lastFrameTimeRef.current = timestamp;

      if (!crashedRef.current && !pausedRef.current) {
        obstacleSpeedRef.current = Math.min(320, 170 + scoreAccumulatorRef.current * 1.8);

        runnerVelocityRef.current -= DINO_GRAVITY * dt;
        runnerLiftRef.current = Math.max(0, runnerLiftRef.current + runnerVelocityRef.current * dt);
        if (runnerLiftRef.current === 0 && runnerVelocityRef.current < 0) {
          runnerVelocityRef.current = 0;
        }

        spawnTimerRef.current -= dt;
        if (spawnTimerRef.current <= 0) {
          const variants: Array<{ variant: ObstacleVariant; width: number; height: number }> = [
            { variant: 'warningSign', width: 18, height: 26 },
            { variant: 'dangerPlug', width: 18, height: 28 },
            { variant: 'faultTower', width: 18, height: 34 },
          ];
          const selected = variants[Math.floor(Math.random() * variants.length)];
          obstaclesRef.current.push({
            x: DINO_VIEW_WIDTH + 12,
            width: selected.width,
            height: selected.height,
            variant: selected.variant,
          });
          spawnTimerRef.current = 0.7 + Math.random() * 0.9;
        }

        obstaclesRef.current = obstaclesRef.current
          .map(obstacle => ({
            ...obstacle,
            x: obstacle.x - obstacleSpeedRef.current * dt,
          }))
          .filter(obstacle => obstacle.x + obstacle.width > -4);

        const runnerTop = DINO_GROUND_Y - DINO_RUNNER_HITBOX_H - runnerLiftRef.current;
        const runnerBottom = runnerTop + DINO_RUNNER_HITBOX_H;
        const runnerLeft = DINO_RUNNER_X;
        const runnerRight = DINO_RUNNER_X + DINO_RUNNER_HITBOX_W;

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
  }, [active, spritesReady]);

  if (!active) return null;

  return (
    <div className={`chat-dino${crashed ? ' is-crashed' : ''}`} role="status" aria-live="polite" onMouseDown={jump}>
      <div className="chat-dino-head">
        <span className="chat-dino-title">Mini game while Voltuś thinks</span>
        <span className="chat-dino-score">Score {score} | Best {bestScore}</span>
      </div>
      <div className="chat-dino-visual">
        <svg className="chat-dino-decor" viewBox="0 0 300 96" aria-hidden="true">
          <defs>
            <linearGradient id="dinoSky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="rgba(34,211,238,0.25)" />
              <stop offset="1" stopColor="rgba(99,102,241,0.12)" />
            </linearGradient>
            <linearGradient id="dinoLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="rgba(34,211,238,0.7)" />
              <stop offset="1" stopColor="rgba(99,102,241,0.25)" />
            </linearGradient>
          </defs>
          <path d="M0 18 C60 5 110 28 170 14 C220 3 265 17 300 8" fill="none" stroke="url(#dinoLine)" strokeWidth="1.4" />
          <path d="M20 44 C38 35 48 45 62 40" fill="none" stroke="url(#dinoSky)" strokeWidth="1.2" />
          <path d="M225 35 C241 27 256 36 272 30" fill="none" stroke="url(#dinoSky)" strokeWidth="1.2" />
          <circle cx="48" cy="16" r="1.5" fill="rgba(34,211,238,0.5)" />
          <circle cx="252" cy="14" r="1.5" fill="rgba(167,139,250,0.45)" />
        </svg>
        <canvas ref={canvasRef} className="chat-dino-canvas" />
        {crashed && (
          <div className="chat-dino-gameover" aria-hidden="true">
            <div className="chat-dino-gameover-inner">
              <div className="chat-dino-gameover-title">Game Over</div>
              <div className="chat-dino-gameover-subtitle">Jump to restart</div>
            </div>
          </div>
        )}
        {countdown > 0 && (
          <div className="chat-dino-countdown" aria-hidden="true">
            <div className="chat-dino-countdown-number">{countdown}</div>
          </div>
        )}
      </div>
      <div className="chat-dino-hint">
        Press Space / Arrow Up / W or click to jump
      </div>
    </div>
  );
};

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL as unknown;
const API_BASE = (typeof RAW_API_BASE === 'string' && RAW_API_BASE.trim() ? RAW_API_BASE : '/api').replace(/\/$/, '');

const RAW_CLOUD_API_BASE = import.meta.env.VITE_CLOUD_API_BASE_URL as unknown;
const CLOUD_API_BASE = (typeof RAW_CLOUD_API_BASE === 'string' && RAW_CLOUD_API_BASE.trim() ? RAW_CLOUD_API_BASE : '').replace(/\/$/, '');

type ModelMode = 'local' | 'cloud';
const MODEL_STORAGE_KEY = 'ai-model-mode';

function getPreferredModelMode(): ModelMode {
  try {
    const stored = localStorage.getItem(MODEL_STORAGE_KEY);
    if (stored === 'cloud') return 'cloud';
  } catch { /* ignore */ }
  return 'local';
}

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

type ThinkingPhase = 'idle' | 'thinking' | 'countdown';

const FINISH_COUNTDOWN_STEP_MS = 300;

const ChatPanel: FC<ChatPanelProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinkingPhase, setThinkingPhase] = useState<ThinkingPhase>('idle');
  const [finishCountdown, setFinishCountdown] = useState(0);
  const [pendingAssistantText, setPendingAssistantText] = useState<string | null>(null);
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
  }, [messages, thinkingPhase]);

  useEffect(() => {
    if (thinkingPhase !== 'countdown') return;
    if (finishCountdown <= 0) return;

    const timer = window.setTimeout(() => {
      setFinishCountdown((prev) => Math.max(0, prev - 1));
    }, FINISH_COUNTDOWN_STEP_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [thinkingPhase, finishCountdown]);

  useEffect(() => {
    if (thinkingPhase !== 'countdown') return;
    if (finishCountdown > 0) return;

    if (pendingAssistantText) {
      setMessages((prev) => [...prev, { role: 'assistant', text: pendingAssistantText }]);
    }

    setPendingAssistantText(null);
    setThinkingPhase('idle');
  }, [thinkingPhase, finishCountdown, pendingAssistantText]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;
    if (thinkingPhase !== 'idle') return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');
    setThinkingPhase('thinking');
    setFinishCountdown(0);
    setPendingAssistantText(null);

    try {
      const modelMode = getPreferredModelMode();
      const requestBase = modelMode === 'cloud' && CLOUD_API_BASE ? CLOUD_API_BASE : API_BASE;

      const response = await fetch(`${requestBase}/chat/voltus?message=${encodeURIComponent(text)}`, {
        headers: {
          Accept: 'application/json',
          'X-AI-Model-Mode': modelMode,
        },
      });

      const payload = await readBackendPayload(response);
      const assistantText = getAssistantText(payload);

      if (!response.ok) {
        const fallback = `Request failed with status ${response.status}`;
        setPendingAssistantText(assistantText || fallback);
        setThinkingPhase('countdown');
        setFinishCountdown(3);
        return;
      }

      setPendingAssistantText(assistantText);
      setThinkingPhase('countdown');
      setFinishCountdown(3);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error while contacting backend.';
      setPendingAssistantText(`Connection error: ${message}`);
      setThinkingPhase('countdown');
      setFinishCountdown(3);
    }
  };

  const hasActivity = messages.length > 0 || thinkingPhase !== 'idle';

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
                {thinkingPhase === 'idle' ? t('chat.ready') : t('chat.thinking')}
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
            <div className="chat-ziutek-placeholder" style={{ height: '110px' }} />
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

          {thinkingPhase !== 'idle' && (
            <div className="chat-thinking-game-wrap">
              <ThinkingMiniGame
                active
                paused={false}
                countdown={thinkingPhase === 'countdown' ? finishCountdown : 0}
              />
            </div>
          )}

          {thinkingPhase === 'thinking' && (
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
                if (e.key === 'Enter' && inputValue.trim() && thinkingPhase === 'idle') {
                  handleSend();
                }
              }}
            />
            <button
              className={`chat-send${inputValue.trim() && thinkingPhase === 'idle' ? ' chat-send-active' : ''}`}
              disabled={!inputValue.trim() || thinkingPhase !== 'idle'}
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
