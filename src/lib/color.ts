export type HSV = { h: number; s: number; v: number };

export const TARGET_COLOR: HSV = { h: 47, s: 77, v: 99 };

export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const hh = ((h % 360) + 360) % 360;
  const ss = s / 100;
  const vv = v / 100;

  const c = vv * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = vv - c;

  let r = 0;
  let g = 0;
  let b = 0;

  if (hh < 60) {
    r = c;
    g = x;
  } else if (hh < 120) {
    r = x;
    g = c;
  } else if (hh < 180) {
    g = c;
    b = x;
  } else if (hh < 240) {
    g = x;
    b = c;
  } else if (hh < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

export function rgbToHsv(r: number, g: number, b: number): HSV {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;

  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rr) {
      h = 60 * (((gg - bb) / delta) % 6);
    } else if (max === gg) {
      h = 60 * ((bb - rr) / delta + 2);
    } else {
      h = 60 * ((rr - gg) / delta + 4);
    }
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s: s * 100, v: v * 100 };
}

export function hsvToHex(h: number, s: number, v: number): string {
  const [r, g, b] = hsvToRgb(h, s, v);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

export type ScoreTier =
  | "Perfect Match!"
  | "Excellent!"
  | "Great!"
  | "Good"
  | "Keep Practicing"
  | "Try Again";

export function getScoreTier(score: number): ScoreTier {
  if (score >= 100) return "Perfect Match!";
  if (score >= 90) return "Excellent!";
  if (score >= 75) return "Great!";
  if (score >= 55) return "Good";
  if (score >= 30) return "Keep Practicing";
  return "Try Again";
}

export function scoreGuess(
  guess: HSV,
  target: HSV,
  hintUsed: boolean
): { score: number; tier: ScoreTier } {
  const hueDiff = Math.abs(guess.h - target.h);
  const dh = Math.min(hueDiff, 360 - hueDiff) / 180;
  const ds = Math.abs(guess.s - target.s) / 100;
  const db = Math.abs(guess.v - target.v) / 100;

  const distance = Math.sqrt(0.5 * dh * dh + 0.25 * ds * ds + 0.25 * db * db);
  const rawScore = Math.round(Math.max(0, 1 - distance) * 100);
  const score = Math.max(0, rawScore - (hintUsed ? 15 : 0));

  return { score, tier: getScoreTier(score) };
}
