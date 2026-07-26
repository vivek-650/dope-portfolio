export type GameType = "click" | "typing" | "aimlab" | "colormatch";

export function normalizeGameType(value: unknown): GameType | null {
  if (value === "click" || value === "typing" || value === "aimlab" || value === "colormatch") {
    return value;
  }

  return null;
}
