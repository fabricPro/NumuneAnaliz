import type { DesenState } from "./types";

// Sinirlar (ERP ile ayni)
export const MIN_WARP = 2;
export const MAX_WARP = 120;
export const MIN_WEFT = 2;
export const MAX_WEFT = 120;
export const MIN_FRAME = 2;
export const MAX_FRAME = 24;
export const MIN_IRO = 1;
export const MAX_IRO = 8;

// Atki motoru/renk paleti (8)
export const IRO_COLORS = [
  "#5b8def",
  "#f0a830",
  "#3fb6a8",
  "#36c98a",
  "#e6b94a",
  "#e8674f",
  "#a78bfa",
  "#ec4899",
];

/** DESEN[warp][weft] = ARMUR[ TAHAR[warp] ][ weft ] — tahar+armür'den hesaplanir. */
export function computeDesen(tahar: number[], armur: boolean[][], weftCount: number): boolean[][] {
  const warpCount = tahar.length;
  const result: boolean[][] = [];
  for (let w = 0; w < warpCount; w++) {
    const f = tahar[w];
    const row: boolean[] = [];
    const src = f != null ? armur[f] : undefined;
    for (let p = 0; p < weftCount; p++) row.push(Boolean(src?.[p]));
    result.push(row);
  }
  return result;
}

/** Düz tahar (0,1,2,... wrap-around) */
export function buildDuzTahar(warpCount: number, frameCount: number): number[] {
  return Array.from({ length: warpCount }, (_, i) => i % frameCount);
}

export function buildEmptyArmur(frameCount: number, weftCount: number): boolean[][] {
  return Array.from({ length: frameCount }, () =>
    Array.from({ length: weftCount }, () => false),
  );
}

export function buildEmptyIroData(weftCount: number): number[] {
  return Array.from({ length: weftCount }, () => 1);
}

export function resizeTahar(tahar: number[], newWarpCount: number): number[] {
  if (newWarpCount === tahar.length) return tahar;
  if (newWarpCount < tahar.length) return tahar.slice(0, newWarpCount);
  return [...tahar, ...Array<number>(newWarpCount - tahar.length).fill(0)];
}

export function resizeArmur(
  armur: boolean[][],
  newFrameCount: number,
  newWeftCount: number,
): boolean[][] {
  return Array.from({ length: newFrameCount }, (_, f) => {
    const oldRow = armur[f] ?? [];
    return Array.from({ length: newWeftCount }, (_, p) => Boolean(oldRow[p]));
  });
}

export function resizeIroData(iroData: number[], newWeftCount: number): number[] {
  if (newWeftCount === iroData.length) return iroData;
  if (newWeftCount < iroData.length) return iroData.slice(0, newWeftCount);
  return [...iroData, ...Array<number>(newWeftCount - iroData.length).fill(1)];
}

export function clampTahar(tahar: number[], newFrameCount: number): number[] {
  return tahar.map((f) => (f < newFrameCount ? f : 0));
}

export function clampIroData(iroData: number[], newIroCount: number): number[] {
  return iroData.map((v) => (v >= 1 && v <= newIroCount ? v : 1));
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Bir boyutu degistir + bagimli dizileri tutarli tut. */
export function setDimension(
  d: DesenState,
  dim: "warpCount" | "weftCount" | "frameCount" | "iroCount",
  value: number,
): DesenState {
  const next = { ...d };
  if (dim === "warpCount") {
    next.warpCount = clamp(value, MIN_WARP, MAX_WARP);
    next.tahar = resizeTahar(d.tahar, next.warpCount);
  } else if (dim === "weftCount") {
    next.weftCount = clamp(value, MIN_WEFT, MAX_WEFT);
    next.armur = resizeArmur(d.armur, d.frameCount, next.weftCount);
    next.iroData = resizeIroData(d.iroData, next.weftCount);
  } else if (dim === "frameCount") {
    next.frameCount = clamp(value, MIN_FRAME, MAX_FRAME);
    next.armur = resizeArmur(d.armur, next.frameCount, d.weftCount);
    next.tahar = clampTahar(d.tahar, next.frameCount);
  } else {
    next.iroCount = clamp(value, MIN_IRO, MAX_IRO);
    next.iroData = clampIroData(d.iroData, next.iroCount);
  }
  return next;
}

export function defaultDesen(): DesenState {
  const warpCount = 6;
  const weftCount = 6;
  const frameCount = 6;
  const iroCount = 1;
  return {
    warpCount,
    weftCount,
    frameCount,
    iroCount,
    raporX: 1,
    raporY: 1,
    tahar: buildDuzTahar(warpCount, frameCount),
    armur: buildEmptyArmur(frameCount, weftCount),
    iroData: buildEmptyIroData(weftCount),
  };
}
