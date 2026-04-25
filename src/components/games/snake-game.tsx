// 'use client'

// import { useEffect, useRef, useState, useCallback } from 'react'

// // ─────────────────────────────────────────────────────────────
// // CONSTANTS
// // ─────────────────────────────────────────────────────────────
// const SPEED          = 2
// const NUM_SEGMENTS   = 4          // long enough to hide inside text
// const SEGMENT_GAP    = 17          // visual gap between body pills
// const HISTORY_STEP   = Math.ceil(SEGMENT_GAP / SPEED)
// const MAX_HISTORY    = (NUM_SEGMENTS + 8) * HISTORY_STEP
// const HEAD_SIZE      = 20
// const BODY_SIZE      = 20
// const HOLE_SIZE      = 50
// const HIT_RADIUS     = 10

// // z-index layers
// // text block = 10
// // snake body = 5  ← BEHIND text
// // snake head = 20 ← IN FRONT of text
// const Z_BODY = 5
// const Z_HEAD = 20
// const Z_HOLE = 8   // hole sits behind head, in front of body, behind text label

// // ─────────────────────────────────────────────────────────────
// // HOLE
// // ─────────────────────────────────────────────────────────────
// function Hole({ x, y, holeRef, entering }) {
//   return (
//     <div
//       ref={holeRef}
//       style={{
//         position: 'fixed',
//         left: x, top: y,
//         width: HOLE_SIZE, height: HOLE_SIZE,
//         transform: 'translate(-50%,-50%)',
//         pointerEvents: 'none',
//       }}
//     >
//       {/* bottom pit (hides body) */}
//       <div style={{
//         position: 'absolute', inset: 10,
//         borderRadius: '50%',
//         zIndex: Z_HOLE,
//       }} />

//       {/* inner softness */}
//       <div style={{
//         position: 'absolute', inset: 18,
//         borderRadius: '50%',
//         background: 'radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.05), transparent 60%)',
//         zIndex: Z_HOLE + 1,
//       }} />

//       {/* top plate */}
//       <div style={{
//         position: 'absolute',
//         left: '50%', bottom: 12,
//         width: HOLE_SIZE * 0.7,
//         height: HOLE_SIZE * 0.22,
//         transform: 'translateX(-50%)',
//         background: '#f5f5f5',
//         borderRadius: '100% / 80%',
//         boxShadow: entering
//           ? '0 0 40px rgba(255,255,255,0.25)'
//           : '0 0 20px rgba(255,255,255,0.1)',
//         zIndex: Z_HEAD + 2,
//       }} />

//       {/* opening mask (hides head when entering) */}
//       <div style={{
//         position: 'absolute',
//         left: '50%', bottom: 12,
//         width: HOLE_SIZE * 0.7,
//         height: HOLE_SIZE * 0.22,
//         transform: 'translateX(-50%) scaleY(0.65)',
//         background: '#000',
//         borderRadius: '100% / 80%',
//         zIndex: Z_HEAD + 3,
//       }} />
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────
// // SNAKE HEAD  (rendered above text)
// // ─────────────────────────────────────────────────────────────
// function Head({ x, y, dir, entering, scale = 1, opacity = 1 }) {
//   // rotate head to face direction
//   const angle = dir.x === 1 ? 0 : dir.x === -1 ? 180 : dir.y === 1 ? 90 : -90

//   return (
//     <div style={{
//       position: 'fixed',
//       left: x, top: y,
//       width: HEAD_SIZE, height: HEAD_SIZE,
//       borderRadius: 4,
//       background: '#fff',
//       transform: `translate(-50%,-50%) rotate(${angle}deg) scale(${scale})`,
//       opacity,
//       zIndex: Z_HEAD,
//       pointerEvents: 'none',
//       boxShadow: '0 2px 16px rgba(255,255,255,0.3)',
//       willChange: 'transform',
//     }}>
//       {/* eye */}
//       <div style={{
//         position: 'absolute',
//         top: '28%', right: '16%',
//         width: 4, height: 4,
//         borderRadius: '50%',
//         background: '#111',
//       }} />
//       {/* shine */}
//       <div style={{
//         position: 'absolute',
//         top: '18%', right: '12%',
//         width: 3, height: 3,
//         borderRadius: '50%',
//         background: 'rgba(255,255,255,0.6)',
//       }} />

//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────
// // SNAKE BODY SEGMENT  (rendered behind text)
// // ─────────────────────────────────────────────────────────────
// function BodySeg({ x, y, index, opacity = 1, scale = 1 }) {
//   // Your original dynamic sizing logic
//   const size  = Math.max(10, BODY_SIZE - index * 0.35)

//   return (
//     <div style={{
//       position: 'fixed',
//       left: x, top: y,
//       width: size, height: size,
//       borderRadius: Math.max(4, size * 0.3),

//       // 1. A subtle gradient gives the object natural volume before shadows even apply
//       background: 'linear-gradient(180deg, #383838 0%, #1e1e1e 100%)',

//       transform: `translate(-50%, -50%) scale(${scale})`,
//       opacity,
//       zIndex: Z_BODY,
//       pointerEvents: 'none',
//       willChange: 'transform',

//       // 2. The Fixed & Enhanced 3D Stack
//       boxShadow: `
//         0 4px 6px -1px rgba(0, 0, 0, 0.7),              /* Outer drop shadow */
//         inset 0 2px 2px rgba(255, 255, 255, 0.35),      /* FIX: Top inner glow (opacity bumped to 0.35) */
//         inset 0 -4px 6px -2px rgba(0, 0, 0, 0.8)        /* Deep bottom inner shadow */
//       `,
//     }} />
//   )
// }
// // ─────────────────────────────────────────────────────────────
// // TEXT BLOCK  (z-index 10, sits between body and head)
// // ─────────────────────────────────────────────────────────────
// function TextBlock({ phase, triggerRef, onStart }) {
//   return (
//     <div style={{
//       position: 'fixed',
//       top: '50%', left: '50%',
//       transform: 'translate(-50%,-50%)',
//       zIndex: 10,
//       textAlign: 'center',
//       pointerEvents: 'none',
//       userSelect: 'none',
//     }}>
//       <p style={{
//         fontFamily: '"Helvetica Neue", Arial, sans-serif',
//         fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
//         fontWeight: 600,
//         color: 'rgba(255,255,255,0.85)',
//         letterSpacing: '0.05em',
//         lineHeight: 1.9,
//         margin: 0,
//         padding: '18px 32px',
//         background: 'rgba(0,0,0,0.0)',  // transparent — body will peek through
//         position: 'relative',
//       }}>
//         I build immersive experiences.
//         <br />
//         Sometimes problems hide in plain sight.
//         <br />
//         <span
//           ref={triggerRef}
//           onClick={onStart}
//           style={{
//             cursor: phase === 'idle' || phase === 'success' ? 'crosshair' : 'default',
//             color: phase === 'idle' || phase === 'success' ? '#fff' : 'rgba(255,255,255,0.3)',
//             borderBottom: phase === 'idle' || phase === 'success'
//               ? '1px solid rgba(255,255,255,0.4)'
//               : '1px solid transparent',
//             transition: 'color 0.3s, border-color 0.3s',
//             pointerEvents: 'auto',
//           }}
//         >
//           The trick is knowing where to look.
//         </span>
//       </p>

//       {/* hint line */}
//       {(phase === 'idle' || phase === 'success') && (
//         <p style={{
//           fontFamily: '"Helvetica Neue", Arial, sans-serif',
//           fontSize: '0.65rem',
//           color: 'rgba(255,255,255,0.2)',
//           letterSpacing: '0.18em',
//           textTransform: 'uppercase',
//           marginTop: 24,
//         }}>
//           {phase === 'success' ? 'click to play again' : 'click the last line to begin'}
//         </p>
//       )}
//       {phase === 'playing' && (
//         <p style={{
//           fontFamily: '"Helvetica Neue", Arial, sans-serif',
//           fontSize: '0.65rem',
//           color: 'rgba(255,255,255,0.15)',
//           letterSpacing: '0.16em',
//           textTransform: 'uppercase',
//           marginTop: 24,
//         }}>
//           arrow keys — guide it into the hole
//         </p>
//       )}
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────
// // MAIN
// // ─────────────────────────────────────────────────────────────
// export default function SnakeGame() {
//   const [phase, setPhase] = useState('idle')
//   const [, forceRender] = useState(0)

//   const headPos   = useRef({ x: 0, y: 0 })
//   const dirRef    = useRef({ x: 1, y: 0 })
//   const dirQueue  = useRef([])
//   const history   = useRef([])
//   const rafRef    = useRef(null)
//   const enterIv   = useRef(null)

//   const holeRef    = useRef(null)
//   const triggerRef = useRef(null)
//   const [holePos, setHolePos]   = useState({ x: 600, y: 300 })

//   // head render state (updated each frame for smooth display)
//   const [headRender, setHeadRender] = useState({ x: 0, y: 0, dir: { x: 1, y: 0 }, scale: 1, opacity: 1 })
//   const [bodySegs,   setBodySegs]   = useState([])

//   // ── helpers ──────────────────────────────────────────────
//   const initHistory = (sx, sy) => {
//     history.current = []
//     // snake starts fully hidden behind text — tail stretches left
//     for (let i = MAX_HISTORY; i >= 0; i--) {
//       history.current.push({ x: sx - i * SPEED, y: sy })
//     }
//   }

//   const randomHole = () => {
//     const margin = 110
//     return {
//       x: margin + Math.random() * (window.innerWidth  - margin * 2),
//       y: margin + Math.random() * (window.innerHeight - margin * 2),
//     }
//   }

//   // ── start ─────────────────────────────────────────────────
//   const startGame = useCallback(() => {
//     if (phase === 'playing' || phase === 'entering') return
//     if (!triggerRef.current) return

//     const rect = triggerRef.current.getBoundingClientRect()
//     const sx = rect.left + rect.width / 2
//     const sy = rect.top  + rect.height / 2

//     headPos.current = { x: sx, y: sy }
//     dirRef.current  = { x: 1, y: 0 }
//     dirQueue.current = []
//     initHistory(sx, sy)

//     setHolePos(randomHole())
//     setPhase('playing')
//   }, [phase])

//   // ── keyboard ──────────────────────────────────────────────
//   const applyDir = useCallback((dx, dy) => {
//     const cur = dirQueue.current.length
//       ? dirQueue.current[dirQueue.current.length - 1]
//       : dirRef.current
//     if (dx !== 0 && cur.x !== 0) return
//     if (dy !== 0 && cur.y !== 0) return
//     dirQueue.current.push({ x: dx, y: dy })
//     if (dirQueue.current.length > 2) dirQueue.current.shift()
//   }, [])

//   useEffect(() => {
//     const handle = (e) => {
//       if (phase !== 'playing') return
//       const map = {
//         ArrowUp: [0,-1], ArrowDown: [0,1],
//         ArrowLeft: [-1,0], ArrowRight: [1,0],
//         w:[0,-1], s:[0,1], a:[-1,0], d:[1,0],
//       }
//       const d = map[e.key]
//       if (d) { e.preventDefault(); applyDir(d[0], d[1]) }
//     }
//     window.addEventListener('keydown', handle)
//     return () => window.removeEventListener('keydown', handle)
//   }, [phase, applyDir])

//   // ── build segments from history ───────────────────────────
//   const buildSegments = (hist, enterPhase = false) => {
//     const segs = []
//     for (let i = 1; i <= NUM_SEGMENTS; i++) {
//       const idx = i * HISTORY_STEP
//       const pt  = hist[idx]
//       if (!pt) break

//       let opacity = 1, scale = 1

//       if (enterPhase) {
//         // last 4 body segs fade+shrink as they enter
//         const fromTail = NUM_SEGMENTS - i
//         if (fromTail < 4) {
//           const t = fromTail / 4
//           opacity = Math.max(0, t)
//           scale   = 0.35 + 0.65 * t
//         }
//       }

//       segs.push({ x: pt.x, y: pt.y, index: i, opacity, scale })
//     }
//     return segs
//   }

//   // ── game loop ─────────────────────────────────────────────
//   useEffect(() => {
//     if (phase !== 'playing') return

//     const loop = () => {
//       // consume direction queue
//       if (dirQueue.current.length) dirRef.current = dirQueue.current.shift()

//       const d = dirRef.current
//       headPos.current.x += d.x * SPEED
//       headPos.current.y += d.y * SPEED

//       // wrap
//       const W = window.innerWidth, H = window.innerHeight
//       if (headPos.current.x >  W + 30) headPos.current.x = -30
//       if (headPos.current.x < -30)      headPos.current.x =  W + 30
//       if (headPos.current.y >  H + 30)  headPos.current.y = -30
//       if (headPos.current.y < -30)      headPos.current.y =  H + 30

//       history.current.unshift({ ...headPos.current })
//       if (history.current.length > MAX_HISTORY) history.current.pop()

//       // collision
//       if (holeRef.current) {
//         const r  = holeRef.current.getBoundingClientRect()
//         const cx = r.left + r.width  / 2
//         const cy = r.top  + r.height / 2
//         const h0 = history.current[0]
//         if (Math.hypot(h0.x - cx, h0.y - cy) < HIT_RADIUS) {
//           setPhase('entering')
//           return
//         }
//       }

//       // update render state
//       setHeadRender({ x: headPos.current.x, y: headPos.current.y, dir: dirRef.current, scale: 1, opacity: 1 })
//       setBodySegs(buildSegments(history.current))

//       rafRef.current = requestAnimationFrame(loop)
//     }

//     rafRef.current = requestAnimationFrame(loop)
//     return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
//   }, [phase])

//   // ── enter animation ───────────────────────────────────────
//   useEffect(() => {
//     if (phase !== 'entering') return
//     if (rafRef.current) cancelAnimationFrame(rafRef.current)

//     // freeze hole centre
//     let holeCX = holePos.x, holeCY = holePos.y
//     if (holeRef.current) {
//       const r = holeRef.current.getBoundingClientRect()
//       holeCX = r.left + r.width  / 2
//       holeCY = r.top  + r.height / 2
//     }

//     let step = 0

//     enterIv.current = setInterval(() => {
//       step++
//       const hist = history.current

//       // 1. Lerp ALL history points toward hole — creates the "sucked in" look
//       //    Front points move faster than back ones
//       for (let i = 0; i < hist.length; i++) {
//         const weight = Math.max(0.04, 0.22 - i * 0.002) // head lerps fastest
//         hist[i] = {
//           x: hist[i].x + (holeCX - hist[i].x) * weight,
//           y: hist[i].y + (holeCY - hist[i].y) * weight,
//         }
//       }

//       // 2. Pop tail faster over time — whoosh acceleration
//       const pops = step < 8 ? 1 : step < 18 ? 2 : step < 30 ? 3 : 4
//       for (let p = 0; p < pops; p++) {
//         if (hist.length > 0) hist.pop()
//       }

//       // 3. Shrink + fade head as it approaches hole
//       const h0     = hist[0]
//       const distH  = h0 ? Math.hypot(h0.x - holeCX, h0.y - holeCY) : 0
//       const headScale   = Math.min(1, Math.max(0.1, distH / 30))
//       const headOpacity = Math.min(1, Math.max(0, distH / 20))

//       if (h0) {
//         setHeadRender({ x: h0.x, y: h0.y, dir: dirRef.current, scale: headScale, opacity: headOpacity })
//       }
//       setBodySegs(buildSegments(hist, true))

//       forceRender(n => n + 1)

//       if (hist.length === 0 || step > 80) {
//         clearInterval(enterIv.current)
//         setPhase('success')
//       }
//     }, 24)

//     return () => clearInterval(enterIv.current)
//   }, [phase])

//   // ── reset ─────────────────────────────────────────────────
//   const reset = () => {
//     setPhase('idle')
//     history.current = []
//     setBodySegs([])
//   }

//   const active = phase === 'playing' || phase === 'entering'

//   // ─────────────────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────────────────
//   return (
//     <div style={{
//       width: '100vw',
//       height: '100vh',
//       background: '#080808',
//       overflow: 'hidden',
//       position: 'relative',
//     }}>

//       {/* ── Body segments — BEHIND text ── */}
//       {active && (
//         <>
//           {/* trailing dots */}
//           {bodySegs.slice(-2).map((seg, i) => (
//             <div key={'dot'+i} style={{
//               position: 'fixed',
//               left: seg.x, top: seg.y,
//               width: i === 0 ? 6 : 4,
//               height: i === 0 ? 6 : 4,
//               borderRadius: '50%',
//               background: '#555',
//               opacity: i === 0 ? 0.8 : 0.6,
//               transform: 'translate(-50%,-50%)',
//               zIndex: Z_BODY,
//             }} />
//           ))}

//           {bodySegs.map((seg, i) => (
//             <BodySeg key={i} {...seg} />
//           ))}
//         </>
//       )}

//       {/* ── Text block — z:10, sits above body ── */}
//       <TextBlock
//         phase={phase}
//         triggerRef={triggerRef}
//         onStart={startGame}
//       />

//       {/* ── Hole — z:8, between body and text ── */}
//       {active && (
//         <Hole x={holePos.x} y={holePos.y} holeRef={holeRef} entering={phase === 'entering'} />
//       )}

//       {/* ── Head — ABOVE text ── */}
//       {active && (
//         <Head
//           x={headRender.x}
//           y={headRender.y}
//           dir={headRender.dir}
//           entering={phase === 'entering'}
//           scale={headRender.scale}
//           opacity={headRender.opacity}
//         />
//       )}

//      {/* ── Premium Success Overlay ── */}
//       {phase === 'success' && (
//         <div
//           onClick={reset}
//           style={{
//             position: 'fixed',
//             inset: 0,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             background: 'rgba(0, 0, 0, 0.6)',
//             backdropFilter: 'blur(8px)', // Glassmorphism blur
//             WebkitBackdropFilter: 'blur(8px)',
//             zIndex: 100,
//             cursor: 'pointer',
//             animation: 'fadeInOverlay 0.4s ease-out forwards',
//           }}
//         >
//           <div style={{
//             position: 'relative',
//             padding: '48px 64px',
//             background: 'linear-gradient(145deg, #1a1a1f 0%, #0f0f11 100%)',
//             borderRadius: '24px',
//             border: '1px solid rgba(255, 255, 255, 0.08)',
//             boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
//             textAlign: 'center',
//             animation: 'modalPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             gap: '12px'
//           }}>

//             {/* Glowing Icon Container */}
//             <div style={{
//               width: 72,
//               height: 72,
//               borderRadius: '50%',
//               background: 'rgba(255,255,255,0.03)',
//               border: '2px solid rgba(255,255,255,0.1)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               marginBottom: '12px',
//               boxShadow: '0 0 30px rgba(255, 255, 255, 0.05), inset 0 0 20px rgba(255,255,255,0.02)',
//             }}>
//               {/* Clean SVG Checkmark */}
//               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                 <polyline points="20 6 9 17 4 12"></polyline>
//               </svg>
//             </div>

//             {/* Primary Title */}
//             <h2 style={{
//               margin: 0,
//               fontSize: '1.75rem',
//               fontWeight: '600',
//               color: '#ffffff',
//               letterSpacing: '0.02em',
//               fontFamily: '"Helvetica Neue", Arial, sans-serif',
//             }}>
//               Game Complete
//             </h2>

//             {/* Flavor Text */}
//             <div style={{
//               fontSize: '0.8rem',
//               letterSpacing: '0.2em',
//               textTransform: 'uppercase',
//               color: 'rgba(255,255,255,0.5)',
//               fontFamily: '"JetBrains Mono", "Courier New", monospace', // Techy monospace font looks great here
//             }}>
//               Down the rabbit hole
//             </div>

//             {/* Pulsing prompt to restart */}
//             <div style={{
//                marginTop: '24px',
//                fontSize: '0.75rem',
//                color: 'rgba(255,255,255,0.3)',
//                animation: 'pulseOpacity 2s infinite ease-in-out'
//             }}>
//                Click anywhere to restart
//             </div>

//           </div>
//         </div>
//       )}

//       {/* Put this block wherever your global styles/animations live */}
//       <style>{`
//         @keyframes fadeInOverlay {
//           from { opacity: 0; backdrop-filter: blur(0px); }
//           to   { opacity: 1; backdrop-filter: blur(8px); }
//         }
//         @keyframes modalPop {
//           from { opacity: 0; transform: translateY(30px) scale(0.95); }
//           to   { opacity: 1; transform: translateY(0) scale(1); }
//         }
//         @keyframes pulseOpacity {
//           0%, 100% { opacity: 0.2; }
//           50% { opacity: 0.7; }
//         }
//       `}</style>
//     </div>
//   )
// }

"use client";

import { useEffect, useRef, useState } from "react";

/* ───────────────── TYPES ───────────────── */
type Vec = { x: number; y: number };

interface SnakeGameProps {
  isActive: boolean;
  onComplete?: () => void;
}

/* ───────────────── CONSTANTS ───────────────── */
const SPEED = 3;
const NUM_SEGMENTS = 4;
const SEGMENT_GAP = 17;
const HISTORY_STEP = Math.ceil(SEGMENT_GAP / SPEED);
const MAX_HISTORY = (NUM_SEGMENTS + 8) * HISTORY_STEP;

const HEAD_SIZE = 22;
const BODY_SIZE = 18;
const HOLE_SIZE = 50;
const HIT_RADIUS = 12;

const Z_BODY = 5;
const Z_HEAD = 20;
const Z_HOLE = 8;

/* ───────────────── HOLE ───────────────── */
function Hole({
  x,
  y,
  holeRef,
  entering,
}: {
  x: number;
  y: number;
  holeRef: React.RefObject<HTMLDivElement | null>;
  entering: boolean;
}) {
  return (
    <div
      ref={holeRef}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: HOLE_SIZE,
        height: HOLE_SIZE,
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 8,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.06), rgba(8,8,8,0.92) 56%, rgba(0,0,0,0.98) 100%)",
          boxShadow:
            "inset 0 4px 12px rgba(255,255,255,0.05), inset 0 -10px 18px rgba(0,0,0,0.8)",
          zIndex: Z_HOLE,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 15,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 45% 35%, rgba(255,255,255,0.07), rgba(0,0,0,0.15) 65%, transparent 90%)",
          zIndex: Z_HOLE + 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 9,
          width: HOLE_SIZE * 0.7,
          height: HOLE_SIZE * 0.2,
          transform: "translateX(-50%)",
          background: "linear-gradient(180deg, rgba(226,232,240,0.82), rgba(148,163,184,0.55))",
          borderRadius: "100% / 80%",
          boxShadow: entering
            ? "0 0 42px rgba(148,163,184,0.4)"
            : "0 0 16px rgba(148,163,184,0.22)",
          zIndex: Z_HEAD + 2,
        }}
      />
    </div>
  );
}

/* ───────────────── HEAD ───────────────── */
function Head({
  x,
  y,
  dir,
  scale = 1,
  opacity = 1,
}: {
  x: number;
  y: number;
  dir: Vec;
  scale?: number;
  opacity?: number;
}) {
  const angle = dir.x === 1 ? 0 : dir.x === -1 ? 180 : dir.y === 1 ? 90 : -90;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: HEAD_SIZE,
        height: HEAD_SIZE,
        borderRadius: "48%",
        background: "linear-gradient(160deg, #8ca270 0%, #5d6c45 55%, #3d452f 100%)",
        transform: `translate(-50%,-50%) rotate(${angle}deg) scale(${scale})`,
        boxShadow:
          "0 6px 14px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.32)",
        opacity,
        zIndex: Z_HEAD,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 5,
          left: 6,
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "rgba(17,24,39,0.9)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 5,
          right: 6,
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "rgba(17,24,39,0.9)",
        }}
      />
    </div>
  );
}

/* ───────────────── BODY ───────────────── */
function BodySeg({
  x,
  y,
  index,
  opacity = 1,
  scale = 1,
}: {
  x: number;
  y: number;
  index: number;
  opacity?: number;
  scale?: number;
}) {
  const size = Math.max(10, BODY_SIZE - index * 0.35);
  const topTone = Math.max(40, 58 - index * 3);
  const bottomTone = Math.max(24, 40 - index * 2);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "46%",
        background: `linear-gradient(180deg, hsl(86 28% ${topTone}%) 0%, hsl(86 30% ${bottomTone}%) 100%)`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        boxShadow:
          "0 5px 12px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.35)",
        opacity,
        zIndex: Z_BODY,
        pointerEvents: "none",
      }}
    />
  );
}

/* ───────────────── MAIN ───────────────── */
export default function SnakeGame({ isActive, onComplete }: SnakeGameProps) {
  const [phase, setPhase] = useState<
    "idle" | "playing" | "entering" | "success"
  >("idle");

  const headPos = useRef<Vec>({ x: 0, y: 0 });
  const dirRef = useRef<Vec>({ x: 1, y: 0 });
  const history = useRef<Vec[]>([]);
  const holeRef = useRef<HTMLDivElement>(null);

  const [holePos, setHolePos] = useState<Vec>({ x: 600, y: 300 });

  const [headRender, setHeadRender] = useState({
    x: 0,
    y: 0,
    dir: { x: 1, y: 0 },
    scale: 1,
    opacity: 1,
  });

  const [bodySegs, setBodySegs] = useState<any[]>([]);

  /* ── START ── */
  useEffect(() => {
    if (!isActive) return;

    headPos.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    dirRef.current = { x: 1, y: 0 };
    history.current = [];

    setHolePos({
      x: 150 + Math.random() * (window.innerWidth - 300),
      y: 150 + Math.random() * (window.innerHeight - 300),
    });

    setPhase("playing");
  }, [isActive]);

  /* ── GAME LOOP ── */
  useEffect(() => {
    if (phase !== "playing") return;

    let raf: number;

    const loop = () => {
      const d = dirRef.current;

      headPos.current.x += d.x * SPEED;
      headPos.current.y += d.y * SPEED;

      history.current.unshift({ ...headPos.current });
      if (history.current.length > MAX_HISTORY) history.current.pop();

      // collision
      if (holeRef.current) {
        const r = holeRef.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;

        const h0 = history.current[0];

        if (Math.hypot(h0.x - cx, h0.y - cy) < HIT_RADIUS) {
          setPhase("entering");
          return;
        }
      }

      const segs = [];
      for (let i = 1; i <= NUM_SEGMENTS; i++) {
        const pt = history.current[i * HISTORY_STEP];
        if (!pt) break;
        segs.push({ x: pt.x, y: pt.y, index: i });
      }

      setBodySegs(segs);

      setHeadRender({
        x: headPos.current.x,
        y: headPos.current.y,
        dir: dirRef.current,
        scale: 1,
        opacity: 1,
      });
      if (typeof window !== "undefined") {
        const targetX = headPos.current.x - window.innerWidth / 2;
        const targetY = headPos.current.y - window.innerHeight / 2;

        window.scrollTo({
          left: targetX,
          top: targetY,
          behavior: "auto", // IMPORTANT: keep it "auto" for game feel
        });
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // ── AUTO SCROLL WITH SNAKE ──
  const SCROLL_MARGIN = 120; // distance from edge to trigger scroll
  const SCROLL_SPEED = 12;

  const viewportTop = window.scrollY;
  const viewportBottom = viewportTop + window.innerHeight;

  const viewportLeft = window.scrollX;
  const viewportRight = viewportLeft + window.innerWidth;

  // vertical scroll
  if (headPos.current.y > viewportBottom - SCROLL_MARGIN) {
    window.scrollBy({ top: SCROLL_SPEED });
  }

  if (headPos.current.y < viewportTop + SCROLL_MARGIN) {
    window.scrollBy({ top: -SCROLL_SPEED });
  }

  // horizontal scroll (optional, safe to keep)
  if (headPos.current.x > viewportRight - SCROLL_MARGIN) {
    window.scrollBy({ left: SCROLL_SPEED });
  }

  if (headPos.current.x < viewportLeft + SCROLL_MARGIN) {
    window.scrollBy({ left: -SCROLL_SPEED });
  }

  /* ── ENTER ANIMATION ── */
  useEffect(() => {
    if (phase !== "entering") return;

    let step = 0;

    const interval = setInterval(() => {
      step++;
      const hist = history.current;

      if (!holeRef.current) return;

      const r = holeRef.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      for (let i = 0; i < hist.length; i++) {
        const w = Math.max(0.05, 0.2 - i * 0.002);
        hist[i] = {
          x: hist[i].x + (cx - hist[i].x) * w,
          y: hist[i].y + (cy - hist[i].y) * w,
        };
      }

      hist.pop();

      const segs = [];
      for (let i = 1; i <= NUM_SEGMENTS; i++) {
        const pt = hist[i * HISTORY_STEP];
        if (!pt) break;
        segs.push({ x: pt.x, y: pt.y, index: i });
      }

      setBodySegs(segs);

      if (hist[0]) {
        const dist = Math.hypot(hist[0].x - cx, hist[0].y - cy);

        setHeadRender({
          x: hist[0].x,
          y: hist[0].y,
          dir: dirRef.current,
          scale: Math.max(0.2, dist / 40),
          opacity: Math.max(0, dist / 30),
        });
      }

      if (hist.length === 0 || step > 60) {
        clearInterval(interval);
        setPhase("success");
      }
    }, 20);

    return () => clearInterval(interval);
  }, [phase]);

  /* ── COMPLETE ── */
  useEffect(() => {
    if (phase === "success") {
      setTimeout(() => {
        onComplete?.();
      }, 900); // let animation finish
    }
  }, [phase, onComplete]);

  /* ── KEYBOARD ── */
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const map: Record<string, Vec> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };
      if (map[e.key]) {
        e.preventDefault();
        dirRef.current = map[e.key];
      }
    };

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {bodySegs.map((seg, i) => (
        <BodySeg key={i} {...seg} />
      ))}
      <Hole
        x={holePos.x}
        y={holePos.y}
        holeRef={holeRef}
        entering={phase === "entering"}
      />
      <Head {...headRender} />

      {phase === "success" && (
        <div
          onClick={() => {
            setPhase("idle");
            onComplete?.();
          }}
          className="absolute inset-0 z-[100] flex cursor-pointer items-center justify-center bg-black/40 backdrop-blur-md"
        >
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black px-10 py-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-zinc-100">
              Game Complete
            </h2>

            <p className="mt-2 text-xs tracking-[0.2em] text-zinc-400">
              Finally the snake is gone. You are really brave.
            </p>

            <p className="mt-5 text-xs text-zinc-500">
              Click anywhere to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
