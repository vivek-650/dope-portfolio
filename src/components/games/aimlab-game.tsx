"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = "normal" | "hard" | "precision";
type Screen = "intro" | "countdown" | "game" | "results";

interface Target {
  id: number;
  x: number;
  y: number;
  r: number;
  spawnedAt: number;
  lifeMs: number;
}

interface ScorePop {
  id: number;
  x: number;
  y: number;
  text: string;
  isCombo: boolean;
}

interface MissMark {
  id: number;
  x: number;
  y: number;
}

interface HitBurst {
  id: number;
  x: number;
  y: number;
}

interface ResultsData {
  score: number;
  hits: number;
  misses: number;
  bestCombo: number;
  acc: number;
  tps: string;
  eff: number;
  grade: string;
  gradeColor: string;
}

interface AimLabProps {
  variant?: "full" | "mini";
}

// ─── Config ───────────────────────────────────────────────────────────────────

const DURATION = 30;

const MODE_CONFIG: Record<Mode, { minR: number; maxR: number; count: number; lifeMs: number; spawnMs: number }> = {
  normal:    { minR: 20, maxR: 36, count: 4, lifeMs: 2200, spawnMs: 480 },
  hard:      { minR: 14, maxR: 26, count: 5, lifeMs: 1600, spawnMs: 350 },
  precision: { minR: 10, maxR: 18, count: 3, lifeMs: 2800, spawnMs: 600 },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AimLab({ variant = "full" }: AimLabProps) {
  const [screen, setScreen] = useState<Screen>("intro");
  const [mode, setMode] = useState<Mode>("normal");
  const [countdownNum, setCountdownNum] = useState(3);

  // Game state (refs for performance inside rAF / intervals)
  const scoreRef      = useRef(0);
  const hitsRef       = useRef(0);
  const missesRef     = useRef(0);
  const comboRef      = useRef(0);
  const bestComboRef  = useRef(0);
  const totalClicksRef= useRef(0);
  const timeLeftRef   = useRef(DURATION);
  const gameActiveRef = useRef(false);
  const targetIdCtr   = useRef(0);
  const targetsRef    = useRef<Target[]>([]);
  const lifeTimers    = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // Display state
  const [hudScore,  setHudScore]  = useState(0);
  const [hudHits,   setHudHits]   = useState(0);
  const [hudAcc,    setHudAcc]    = useState("—");
  const [hudTime,   setHudTime]   = useState(DURATION);
  const [combo,     setCombo]     = useState(0);
  const [targets,   setTargets]   = useState<Target[]>([]);
  const [scorePops, setScorePops] = useState<ScorePop[]>([]);
  const [missMark,  setMissMark]  = useState<MissMark[]>([]);
  const [hitBursts, setHitBursts] = useState<HitBurst[]>([]);
  const [results,   setResults]   = useState<ResultsData | null>(null);

  // Timers refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const popIdCtr = useRef(0);

  // Trail canvas
  const trailRef    = useRef<HTMLCanvasElement>(null);
  const trailPoints = useRef<{ x: number; y: number; t: number }[]>([]);
  const trailRaf    = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── HUD updater ──────────────────────────────────────────────────────────

  const updateHUD = useCallback(() => {
    setHudScore(scoreRef.current);
    setHudHits(hitsRef.current);
    const total = hitsRef.current + missesRef.current;
    setHudAcc(total > 0 ? `${Math.round((hitsRef.current / total) * 100)}%` : "—");
  }, []);

  // ── Spawn logic ──────────────────────────────────────────────────────────

  const spawnTarget = useCallback((currentMode: Mode) => {
    if (!gameActiveRef.current) return;
    const cfg = MODE_CONFIG[currentMode];
    const r   = cfg.minR + Math.random() * (cfg.maxR - cfg.minR);
    const container = containerRef.current;
    if (!container) return;
    const cw = container.offsetWidth;
    const ch = container.offsetHeight;
    const margin = r + 10;
    const x = margin + Math.random() * (cw - margin * 2);
    const y = margin + Math.random() * (ch - margin * 2);
    const lifeMs = cfg.lifeMs + (Math.random() - 0.5) * 400;
    const id = ++targetIdCtr.current;
    const target: Target = { id, x, y, r, spawnedAt: Date.now(), lifeMs };

    targetsRef.current.push(target);
    setTargets(prev => [...prev, target]);

    const timer = setTimeout(() => {
      if (!gameActiveRef.current) return;
      removeTarget(id, true);
    }, lifeMs);
    lifeTimers.current.set(id, timer);
  }, []); // eslint-disable-line

  const spawnBatch = useCallback((currentMode: Mode) => {
    const cfg = MODE_CONFIG[currentMode];
    const existing = targetsRef.current.length;
    const toSpawn = Math.max(0, cfg.count - existing);
    for (let i = 0; i < toSpawn; i++) {
      setTimeout(() => { if (gameActiveRef.current) spawnTarget(currentMode); }, i * 80);
    }
  }, [spawnTarget]);

  // ── Remove target ────────────────────────────────────────────────────────

  const removeTarget = useCallback((id: number, isMiss: boolean) => {
    const timer = lifeTimers.current.get(id);
    if (timer) { clearTimeout(timer); lifeTimers.current.delete(id); }
    targetsRef.current = targetsRef.current.filter(t => t.id !== id);
    setTargets(prev => prev.filter(t => t.id !== id));
    if (isMiss) {
      missesRef.current++;
      comboRef.current = 0;
      setCombo(0);
      updateHUD();
    }
  }, [updateHUD]);

  // ── Hit target ───────────────────────────────────────────────────────────

  const hitTarget = useCallback((id: number, x: number, y: number, r: number) => {
    if (!gameActiveRef.current) return;
    if (!targetsRef.current.find(t => t.id === id)) return;

    const timer = lifeTimers.current.get(id);
    if (timer) { clearTimeout(timer); lifeTimers.current.delete(id); }
    targetsRef.current = targetsRef.current.filter(t => t.id !== id);
    setTargets(prev => prev.filter(t => t.id !== id));

    hitsRef.current++;
    totalClicksRef.current++;
    comboRef.current++;
    if (comboRef.current > bestComboRef.current) bestComboRef.current = comboRef.current;
    setCombo(comboRef.current);

    const multiplier = comboRef.current >= 10 ? 3 : comboRef.current >= 5 ? 2 : 1;
    const pts = Math.round((10 + Math.floor(r > 30 ? 8 : r > 20 ? 5 : 3)) * multiplier);
    scoreRef.current += pts;
    updateHUD();

    // Effects
    const pid = ++popIdCtr.current;
    setScorePops(prev => [...prev, { id: pid, x, y: y - 20, text: multiplier > 1 ? `+${pts} ×${multiplier}` : `+${pts}`, isCombo: multiplier > 1 }]);
    setTimeout(() => setScorePops(prev => prev.filter(p => p.id !== pid)), 700);

    const bid = ++popIdCtr.current;
    setHitBursts(prev => [...prev, { id: bid, x, y }]);
    setTimeout(() => setHitBursts(prev => prev.filter(b => b.id !== bid)), 400);

    // respawn
    setTimeout(() => { if (gameActiveRef.current) spawnBatch(mode); }, 60);
  }, [mode, updateHUD, spawnBatch]);

  // ── Miss click ───────────────────────────────────────────────────────────

  const handleAreaClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameActiveRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-target]")) return;

    missesRef.current++;
    totalClicksRef.current++;
    comboRef.current = 0;
    setCombo(0);
    updateHUD();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mid = ++popIdCtr.current;
    setMissMark(prev => [...prev, { id: mid, x, y }]);
    setTimeout(() => setMissMark(prev => prev.filter(m => m.id !== mid)), 500);
  }, [updateHUD]);

  // ── Timer tick ───────────────────────────────────────────────────────────

  const tick = useCallback(() => {
    timeLeftRef.current--;
    setHudTime(timeLeftRef.current);
    if (timeLeftRef.current <= 0) endGame();
  }, []); // eslint-disable-line

  // ── End game ─────────────────────────────────────────────────────────────

  const endGame = useCallback(() => {
    gameActiveRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    lifeTimers.current.forEach(t => clearTimeout(t));
    lifeTimers.current.clear();
    targetsRef.current = [];
    setTargets([]);

    const total = hitsRef.current + missesRef.current;
    const acc   = total > 0 ? Math.round((hitsRef.current / total) * 100) : 0;
    const eff   = totalClicksRef.current > 0 ? Math.round((hitsRef.current / totalClicksRef.current) * 100) : 0;
    const tps   = (hitsRef.current / DURATION).toFixed(2);

    let grade: string, gradeColor: string;
    if (acc >= 95 && scoreRef.current >= 500) { grade = "S RANK"; gradeColor = "#FFD700"; }
    else if (acc >= 85 && scoreRef.current >= 350) { grade = "A RANK"; gradeColor = "#4ade80"; }
    else if (acc >= 70 && scoreRef.current >= 200) { grade = "B RANK"; gradeColor = "#60a5fa"; }
    else if (acc >= 55) { grade = "C RANK"; gradeColor = "#fb923c"; }
    else { grade = "D RANK"; gradeColor = "#FF3131"; }

    setTimeout(() => {
      setResults({ score: scoreRef.current, hits: hitsRef.current, misses: missesRef.current, bestCombo: bestComboRef.current, acc, tps, eff, grade, gradeColor });
      setScreen("results");
    }, 400);
  }, []);

  // ── Start game ───────────────────────────────────────────────────────────

  const startGame = useCallback((currentMode: Mode) => {
    scoreRef.current = 0; hitsRef.current = 0; missesRef.current = 0;
    comboRef.current = 0; bestComboRef.current = 0; totalClicksRef.current = 0;
    timeLeftRef.current = DURATION; targetsRef.current = [];
    setHudScore(0); setHudHits(0); setHudAcc("—"); setHudTime(DURATION);
    setCombo(0); setTargets([]); setScorePops([]); setMissMark([]); setHitBursts([]);
    setResults(null);

    gameActiveRef.current = true;
    setScreen("game");

    setTimeout(() => {
      spawnBatch(currentMode);
      spawnRef.current = setInterval(() => { if (gameActiveRef.current) spawnBatch(currentMode); }, MODE_CONFIG[currentMode].spawnMs);
      timerRef.current = setInterval(tick, 1000);
    }, 50);
  }, [spawnBatch, tick]);

  // ── Countdown ────────────────────────────────────────────────────────────

  const startCountdown = useCallback((currentMode: Mode) => {
    setScreen("countdown");
    setCountdownNum(3);
    let n = 3;
    const iv = setInterval(() => {
      n--;
      if (n > 0) { setCountdownNum(n); }
      else { clearInterval(iv); startGame(currentMode); }
    }, 950);
  }, [startGame]);

  // ── Trail ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (screen !== "game") return;
    const canvas = trailRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      trailPoints.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t: Date.now() });
      if (trailPoints.current.length > 60) trailPoints.current.shift();
    };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now(), maxAge = 500;
      const recent = trailPoints.current.filter(p => now - p.t < maxAge);
      if (recent.length > 2) {
        for (let i = 1; i < recent.length; i++) {
          const age = (now - recent[i].t) / maxAge;
          ctx.strokeStyle = `rgba(255,49,49,${(1 - age) * 0.35})`;
          ctx.lineWidth   = (1 - age) * 2;
          ctx.beginPath();
          ctx.moveTo(recent[i - 1].x, recent[i - 1].y);
          ctx.lineTo(recent[i].x, recent[i].y);
          ctx.stroke();
        }
      }
      trailRaf.current = requestAnimationFrame(draw);
    };
    trailRaf.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(trailRaf.current);
      trailPoints.current = [];
    };
  }, [screen]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    lifeTimers.current.forEach(t => clearTimeout(t));
  }, []);

  // ── Derived display ──────────────────────────────────────────────────────

  const multDisplay = combo >= 10 ? "×3" : combo >= 5 ? "×2" : "";
  const multColor   = combo >= 10 ? "#FF3131" : combo >= 5 ? "#FFD700" : "#fff";
  const showCombo   = combo >= 3;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .al-app, .al-app * { box-sizing: border-box; }
        .al-app * { margin: 0; padding: 0; }

        :root {
          --red: #FF3131; --red-dim: #7a1a1a; --red-glow: rgba(255,49,49,0.35);
          --bg: #0a0a0c; --surface: #111116; --surface2: #18181f;
          --text: #f0f0f5; --muted: #5a5a72; --gold: #FFD700;
          --grid: rgba(255,255,255,0.035);
          --al-font-sans: var(--font-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
          --al-font-mono: var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .al-app {
          width: 100%; height: 600px; position: relative; overflow: hidden;
          font-family: var(--al-font-sans); color: var(--text);
          background: var(--bg); cursor: crosshair; user-select: none;
        }

        .al-app-mini {
          height: 560px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .al-app-mini .al-results {
          justify-content: flex-start;
          overflow-y: auto;
          padding: 18px 0 22px;
        }

        .al-app-mini .al-res-score { font-size: 58px; }

        .al-app-mini .al-res-grid,
        .al-app-mini .al-submit-wrap,
        .al-app-mini .al-submit-msg,
        .al-app-mini .al-timeline-bar,
        .al-app-mini .al-eval-rows {
          width: min(92%, 380px);
        }

        .al-app-mini .al-res-actions {
          flex-wrap: wrap;
          justify-content: center;
          padding: 0 10px 6px;
        }

        .al-app-mini .al-res-btn {
          padding: 10px 18px;
          font-size: 12px;
        }

        /* ── Grid background ── */
        .al-grid-bg {
          position: absolute; inset: 56px 0 0 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(var(--grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .al-grid-bg::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, var(--bg) 100%);
        }

        /* ── Trail canvas ── */
        .al-trail { position: absolute; inset: 0; pointer-events: none; z-index: 1; }

        /* ── HUD ── */
        .al-hud {
          position: absolute; top: 0; left: 0; right: 0; height: 56px;
          background: rgba(10,10,12,0.92); border-bottom: 1px solid #1e1e28;
          display: flex; align-items: center; padding: 0 24px; z-index: 5;
          backdrop-filter: blur(8px);
        }
        .al-hud-title { font-size: 11px; letter-spacing: 3px; color: var(--muted); text-transform: uppercase; font-weight: 600; margin-right: auto; }
        .al-hud-title span { color: var(--red); }
        .al-hud-item { display: flex; flex-direction: column; align-items: center; min-width: 80px; }
        .al-hud-label { font-size: 9px; letter-spacing: 3px; color: var(--muted); text-transform: uppercase; font-family: var(--al-font-mono); }
        .al-hud-val { font-size: 22px; font-weight: 700; font-family: var(--al-font-mono); line-height: 1.1; }
        .al-hud-sep { width: 1px; height: 32px; background: #1e1e28; margin: 0 18px; }
        .al-hud-timer { color: var(--red); }
        @keyframes al-blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .al-hud-timer-urgent { color: var(--red); animation: al-blink .5s infinite; }

        /* ── Targets area ── */
        .al-targets-area {
          position: absolute; inset: 56px 0 0 0; z-index: 2;
        }

        /* ── Target ── */
        .al-target {
          position: absolute; border-radius: 50%;
          transform: translate(-50%, -50%);
          cursor: crosshair; pointer-events: all;
        }
        .al-target-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px solid var(--red);
          animation: al-ring-pulse 1s ease-out infinite;
        }
        .al-target-inner {
          position: absolute; inset: 4px; border-radius: 50%;
          background: radial-gradient(circle at 38% 35%, #ff6b6b, var(--red));
          transition: transform .05s;
        }
        .al-target-inner:hover { transform: scale(1.06); }
        .al-target-dot {
          position: absolute; border-radius: 50%; background: #fff;
          top: 50%; left: 50%; transform: translate(-50%, -50%);
        }
        .al-target-lifebar {
          position: absolute; bottom: -6px; left: 0; right: 0;
          height: 3px; background: #1e1e28; border-radius: 2px; overflow: hidden;
        }
        .al-target-lifebar-fill {
          height: 100%; background: var(--red); border-radius: 2px;
          transition-property: width; transition-timing-function: linear;
        }
        @keyframes al-ring-pulse { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(1.6);opacity:0} }
        @keyframes al-target-in  { 0%{transform:translate(-50%,-50%) scale(.2);opacity:0} 60%{transform:translate(-50%,-50%) scale(1.15)} 100%{transform:translate(-50%,-50%) scale(1);opacity:1} }
        .al-target-enter { animation: al-target-in .18s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        /* ── Effects ── */
        .al-hit-burst { position: absolute; pointer-events: none; transform: translate(-50%,-50%); z-index: 20; }
        .al-hit-ring {
          position: absolute; top: 50%; left: 50%; border-radius: 50%;
          border: 2px solid var(--red); transform: translate(-50%,-50%);
          animation: al-hit-expand .4s ease-out forwards;
        }
        @keyframes al-hit-expand { 0%{width:10px;height:10px;opacity:1} 100%{width:80px;height:80px;opacity:0} }

        .al-miss-x {
          position: absolute; font-size: 20px; color: rgba(255,49,49,0.67);
          font-weight: 700; transform: translate(-50%,-50%); pointer-events: none; z-index: 20;
          font-family: var(--al-font-mono);
          animation: al-fade-up .5s ease-out forwards;
        }
        @keyframes al-fade-up { 0%{opacity:1;transform:translate(-50%,-60%)} 100%{opacity:0;transform:translate(-50%,-90%)} }

        .al-score-pop {
          position: absolute; font-size: 16px; font-weight: 700; color: var(--red);
          transform: translate(-50%,-50%); pointer-events: none; z-index: 20;
          font-family: var(--al-font-mono); text-shadow: 0 0 8px var(--red-glow);
          animation: al-score-float .7s ease-out forwards;
        }
        .al-score-pop-combo { color: var(--gold); font-size: 20px; }
        @keyframes al-score-float { 0%{opacity:1;transform:translate(-50%,-50%)} 100%{opacity:0;transform:translate(-50%,-120%)} }

        /* ── Combo display ── */
        .al-combo {
          position: absolute; right: 24px; top: 72px;
          font-family: var(--al-font-mono); font-size: 11px; letter-spacing: 2px;
          color: var(--gold); text-align: right; z-index: 5;
          opacity: 0; transition: opacity .3s; pointer-events: none;
        }
        .al-combo-show { opacity: 1; }
        .al-combo-mult { font-size: 28px; font-weight: 700; line-height: 1; }

        /* ── Screens ── */
        .al-screen {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; z-index: 10;
        }

        /* Intro */
        .al-intro { background: var(--bg); gap: 20px; }
        .al-intro-subtitle { font-size: 11px; letter-spacing: 5px; text-transform: uppercase; color: var(--muted); margin-bottom: -12px; }
        .al-intro-title { font-size: 48px; font-weight: 800; line-height: 1; letter-spacing: -2px; }
        .al-intro-title span { color: var(--red); }
        .al-mode-row { display: flex; gap: 10px; margin-top: 8px; }
        .al-mode-btn {
          background: var(--surface2); border: 1px solid #2a2a35; color: var(--muted);
          padding: 10px 22px; border-radius: 6px; cursor: pointer;
          font-family: var(--al-font-sans); font-size: 13px; font-weight: 600;
          letter-spacing: 1px; transition: all .2s;
        }
        .al-mode-btn:hover, .al-mode-btn-active {
          background: var(--red-dim) !important; border-color: var(--red) !important; color: var(--text) !important;
        }
        .al-start-btn {
          background: var(--red); color: #fff; border: none;
          padding: 14px 48px; border-radius: 6px;
          font-family: var(--al-font-sans); font-size: 15px; font-weight: 700;
          cursor: pointer; letter-spacing: 2px; text-transform: uppercase;
          transition: all .15s; margin-top: 4px;
        }
        .al-start-btn:hover { background: #ff4d4d; transform: scale(1.03); }
        .al-start-btn:active { transform: scale(0.97); }
        .al-tip { font-size: 12px; color: var(--muted); letter-spacing: 1px; }

        /* Countdown */
        .al-countdown { background: rgba(10,10,12,0.85); pointer-events: none; }
        .al-countdown-num {
          font-size: 120px; font-weight: 800; color: var(--red);
          font-family: var(--al-font-mono);
          text-shadow: 0 0 40px var(--red-glow);
          animation: al-count-pop .9s ease-in-out;
        }
        @keyframes al-count-pop { 0%{transform:scale(1.5);opacity:0} 30%{opacity:1} 80%{transform:scale(1)} 100%{transform:scale(.9);opacity:0} }

        /* Results */
        .al-results { background: rgba(8,8,10,0.96); gap: 0; }
        .al-res-header { font-size: 10px; letter-spacing: 5px; color: var(--muted); text-transform: uppercase; margin-bottom: 4px; }
        .al-res-score { font-size: 72px; font-weight: 800; color: var(--red); font-family: var(--al-font-mono); line-height: 1; text-shadow: 0 0 30px var(--red-glow); }
        .al-res-grade { font-size: 16px; font-weight: 700; letter-spacing: 4px; margin-bottom: 20px; text-transform: uppercase; }
        .al-res-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; width: 380px; margin: 0 0 20px; }
        .al-res-card { background: var(--surface); border: 1px solid #1e1e28; border-radius: 8px; padding: 14px; text-align: center; }
        .al-res-card-label { font-size: 9px; letter-spacing: 3px; color: var(--muted); text-transform: uppercase; margin-bottom: 6px; font-family: var(--al-font-mono); }
        .al-res-card-val { font-size: 24px; font-weight: 700; font-family: var(--al-font-mono); }
        .al-good { color: #4ade80; } .al-warn { color: var(--gold); } .al-bad { color: var(--red); }
        .al-timeline-bar { width: 380px; height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden; margin-bottom: 20px; }
        .al-timeline-fill { height: 100%; background: linear-gradient(90deg, var(--red), var(--gold)); border-radius: 3px; transition: width 1s ease; }
        .al-eval-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); font-family: var(--al-font-mono); margin-bottom: 6px; }
        .al-eval-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .al-eval-text { color: var(--text); }
        .al-eval-rows { width: 380px; margin-bottom: 20px; }
        .al-res-actions { display: flex; gap: 12px; }
        .al-res-btn {
          padding: 11px 30px; border-radius: 6px; font-family: var(--al-font-sans);
          font-weight: 700; font-size: 13px; cursor: pointer; letter-spacing: 2px;
          text-transform: uppercase; transition: all .15s; border: none;
        }
        .al-res-btn-primary { background: var(--red); color: #fff; }
        .al-res-btn-primary:hover { background: #ff4444; }
        .al-res-btn-secondary { background: var(--surface2); color: var(--muted); border: 1px solid #2a2a35; }
        .al-res-btn-secondary:hover { color: var(--text); border-color: #444; }
        .al-submit-wrap { width: 380px; margin-bottom: 14px; }
        .al-submit-label { display: block; font-size: 10px; letter-spacing: 3px; color: var(--muted); text-transform: uppercase; margin-bottom: 8px; font-family: var(--al-font-mono); }
        .al-submit-input {
          width: 100%; background: var(--surface2); border: 1px solid #2a2a35; color: var(--text);
          border-radius: 8px; padding: 11px 12px; font-family: var(--al-font-mono); font-size: 13px;
          outline: none;
        }
        .al-submit-input:focus { border-color: var(--red); box-shadow: 0 0 0 2px rgba(255,49,49,0.2); }
        .al-submit-msg { width: 380px; font-size: 12px; margin-bottom: 10px; font-family: var(--al-font-mono); }
        .al-submit-msg-ok { color: #4ade80; }
        .al-submit-msg-err { color: #FF3131; }
        .al-res-btn[disabled] { opacity: .6; cursor: not-allowed; }
      `}</style>

      <div className={`al-app ${variant === "mini" ? "al-app-mini" : ""}`}>

        {/* Trail canvas */}
        <canvas ref={trailRef} className="al-trail" />

        {/* ── Intro ── */}
        {screen === "intro" && (
          <div className="al-screen al-intro">
            <div className="al-intro-title">AIM<span>.</span>LAB</div>
            {/* <div className="al-intro-subtitle"1342879>Portfolio Widget</div> */}
            <div className="al-mode-row">
              {(["normal", "hard", "precision"] as Mode[]).map(m => (
                <button
                  key={m}
                  className={`al-mode-btn${mode === m ? " al-mode-btn-active" : ""}`}
                  onClick={() => setMode(m)}
                  style={mode === m ? { background: "var(--red-dim)", borderColor: "var(--red)", color: "var(--text)" } : {}}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
            <button className="al-start-btn" onClick={() => startCountdown(mode)}>START</button>
            <div className="al-tip">Click targets as fast as you can · 30 seconds</div>
          </div>
        )}

        {/* ── Countdown ── */}
        {screen === "countdown" && (
          <div className="al-screen al-countdown">
            <div key={countdownNum} className="al-countdown-num">{countdownNum}</div>
          </div>
        )}

        {/* ── Game ── */}
        {screen === "game" && (
          <>
            {/* Grid background */}
            <div className="al-grid-bg" />

            {/* HUD */}
            <div className="al-hud">
              <div className="al-hud-title">AIM<span>.</span>LAB</div>
              <div className="al-hud-item">
                <div className="al-hud-label">Time</div>
                <div className={`al-hud-val ${hudTime <= 10 ? "al-hud-timer-urgent" : "al-hud-timer"}`}>{hudTime}</div>
              </div>
              <div className="al-hud-sep" />
              <div className="al-hud-item">
                <div className="al-hud-label">Score</div>
                <div className="al-hud-val">{hudScore}</div>
              </div>
              <div className="al-hud-sep" />
              <div className="al-hud-item">
                <div className="al-hud-label">Hits</div>
                <div className="al-hud-val">{hudHits}</div>
              </div>
              <div className="al-hud-sep" />
              <div className="al-hud-item">
                <div className="al-hud-label">Acc</div>
                <div className="al-hud-val">{hudAcc}</div>
              </div>
            </div>

            {/* Combo display */}
            <div className={`al-combo${showCombo ? " al-combo-show" : ""}`}>
              <div className="al-combo-mult" style={{ color: multColor }}>×{combo}</div>
              {multDisplay && <div>{multDisplay} COMBO</div>}
            </div>

            {/* Targets area + click capture */}
            <div
              ref={containerRef}
              className="al-targets-area"
              onClick={handleAreaClick}
            >
              {/* Targets */}
              {targets.map(t => (
                <TargetEl key={t.id} target={t} onHit={hitTarget} />
              ))}

              {/* Hit bursts */}
              {hitBursts.map(b => (
                <div key={b.id} className="al-hit-burst" style={{ left: b.x, top: b.y }}>
                  <div className="al-hit-ring" />
                </div>
              ))}

              {/* Score pops */}
              {scorePops.map(p => (
                <div key={p.id} className={`al-score-pop${p.isCombo ? " al-score-pop-combo" : ""}`}
                  style={{ left: p.x, top: p.y }}>{p.text}</div>
              ))}

              {/* Miss marks */}
              {missMark.map(m => (
                <div key={m.id} className="al-miss-x" style={{ left: m.x, top: m.y }}>✕</div>
              ))}
            </div>
          </>
        )}

        {/* ── Results ── */}
        {screen === "results" && results && (
          <ResultsScreen
            results={results}
            onReplay={() => startCountdown(mode)}
            onMenu={() => setScreen("intro")}
          />
        )}
      </div>
    </>
  );
}

// ─── TargetEl ─────────────────────────────────────────────────────────────────

function TargetEl({ target, onHit }: { target: Target; onHit: (id: number, x: number, y: number, r: number) => void }) {
  const dotSize = Math.max(4, target.r * 0.2);
  const [fillWidth, setFillWidth] = useState("100%");

  useEffect(() => {
    const raf = requestAnimationFrame(() => setFillWidth("0%"));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      data-target="1"
      className="al-target al-target-enter"
      style={{ width: target.r * 2, height: target.r * 2, left: target.x, top: target.y }}
      onClick={(e) => { e.stopPropagation(); onHit(target.id, target.x, target.y, target.r); }}
    >
      <div className="al-target-ring" />
      <div className="al-target-inner">
        <div className="al-target-dot" style={{ width: dotSize, height: dotSize }} />
      </div>
      <div className="al-target-lifebar">
        <div className="al-target-lifebar-fill" style={{ width: fillWidth, transitionDuration: `${target.lifeMs}ms` }} />
      </div>
    </div>
  );
}

// ─── ResultsScreen ────────────────────────────────────────────────────────────

function buildEval(acc: number, misses: number, combo: number, tps: number) {
  const items: { color: string; text: string }[] = [];
  if (acc >= 90) items.push({ color: "#4ade80", text: "Excellent accuracy — precision clicking detected" });
  else if (acc >= 70) items.push({ color: "#FFD700", text: "Good accuracy — minor improvements possible" });
  else items.push({ color: "#FF3131", text: "Accuracy needs work — focus on clicking, not speed" });

  if (tps >= 1.5) items.push({ color: "#4ade80", text: "High click rate — great reflexes and throughput" });
  else if (tps >= 0.8) items.push({ color: "#FFD700", text: "Moderate throughput — room to increase speed" });
  else items.push({ color: "#5a5a72", text: "Low throughput — try a faster mode when ready" });

  if (combo >= 8) items.push({ color: "#4ade80", text: "Long combo chain maintained — excellent flow" });
  else if (combo >= 4) items.push({ color: "#FFD700", text: "Good combo control — keep the streak alive" });

  if (misses <= 2) items.push({ color: "#4ade80", text: "Near-zero misses — surgical precision!" });
  return items.slice(0, 4);
}

function ResultsScreen({ results, onReplay, onMenu }: { results: ResultsData; onReplay: () => void; onMenu: () => void }) {
  const [barWidth, setBarWidth] = useState("0%");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { const t = setTimeout(() => setBarWidth(`${Math.min(100, results.acc)}%`), 100); return () => clearTimeout(t); }, [results.acc]);

  const evals = buildEval(results.acc, results.misses, results.bestCombo, parseFloat(results.tps));
  const safeUsername = useMemo(() => {
    const normalized = username.trim();
    return normalized.length > 0 ? normalized.slice(0, 24) : "anonymous";
  }, [username]);

  const submitScore = async () => {
    if (submitting || submitted) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "aimlab",
          username: safeUsername,
          score: results.score,
          accuracy: results.acc,
          durationMs: DURATION * 1000,
        }),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Unable to submit score.");
      }

      window.localStorage.setItem("game:lastUsername", safeUsername);
      window.localStorage.setItem("game:lastUsername:aimlab", safeUsername);
      setSubmitted(true);
      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Unexpected error.");
    }
  };

  return (
    <div className="al-screen al-results">
      <div className="al-res-header">Session Complete</div>
      <div className="al-res-score">{results.score}</div>
      <div className="al-res-grade" style={{ color: results.gradeColor }}>{results.grade}</div>
      <div className="al-res-grid">
        <div className="al-res-card">
          <div className="al-res-card-label">Accuracy</div>
          <div className={`al-res-card-val ${results.acc >= 90 ? "al-good" : results.acc >= 70 ? "al-warn" : "al-bad"}`}>{results.acc}%</div>
        </div>
        <div className="al-res-card">
          <div className="al-res-card-label">Hits</div>
          <div className="al-res-card-val">{results.hits}</div>
        </div>
        <div className="al-res-card">
          <div className="al-res-card-label">Misses</div>
          <div className={`al-res-card-val ${results.misses <= 3 ? "al-good" : results.misses <= 10 ? "al-warn" : "al-bad"}`}>{results.misses}</div>
        </div>
        <div className="al-res-card">
          <div className="al-res-card-label">Best Combo</div>
          <div className={`al-res-card-val ${results.bestCombo >= 10 ? "al-good" : results.bestCombo >= 5 ? "al-warn" : ""}`}>×{results.bestCombo}</div>
        </div>
        <div className="al-res-card">
          <div className="al-res-card-label">Targets/s</div>
          <div className="al-res-card-val">{results.tps}</div>
        </div>
        <div className="al-res-card">
          <div className="al-res-card-label">Efficiency</div>
          <div className="al-res-card-val">{results.eff}%</div>
        </div>
      </div>
      <div className="al-timeline-bar">
        <div className="al-timeline-fill" style={{ width: barWidth }} />
      </div>
      <div className="al-eval-rows">
        {evals.map((e, i) => (
          <div key={i} className="al-eval-row">
            <div className="al-eval-dot" style={{ background: e.color }} />
            <div className="al-eval-text">{e.text}</div>
          </div>
        ))}
      </div>

      <div className="al-submit-wrap">
        <label htmlFor="aimlab-username" className="al-submit-label">Username</label>
        <input
          id="aimlab-username"
          value={username}
          maxLength={24}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="anonymous"
          className="al-submit-input"
        />
      </div>

      {error ? <div className="al-submit-msg al-submit-msg-err">{error}</div> : null}
      {submitted ? <div className="al-submit-msg al-submit-msg-ok">Score submitted successfully.</div> : null}

      <div className="al-res-actions">
        <button className="al-res-btn al-res-btn-primary" onClick={submitScore} disabled={submitting || submitted}>
          {submitting ? "Submitting..." : submitted ? "Submitted" : "Submit Score"}
        </button>
        <Link href="/aimlab/leaderboard" className="al-res-btn al-res-btn-secondary">Leaderboard</Link>
        <button className="al-res-btn al-res-btn-primary" onClick={onReplay}>PLAY AGAIN</button>
        <button className="al-res-btn al-res-btn-secondary" onClick={onMenu}>MENU</button>
      </div>
    </div>
  );
}