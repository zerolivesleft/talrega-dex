import sharp from "sharp";

/** Pixels within this Euclidean distance of the corner color are treated as background for flood-fill. */
const BG_TOL = 32;
/** Anti-aliased fringe: blend toward transparent between BG_TOL and this distance from the sheet green. */
const FEATHER_TOL = 52;

/**
 * Removes the uniform mint-green sheet background from shiny PNGs embedded in the xlsx.
 * Uses edge-seeded flood fill so interior greens on Pokémon are preserved unless they match the bg and touch the border region.
 */
export async function removeShinySheetBackgroundPng(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const rgba = new Uint8ClampedArray(data);
  const n = w * h;

  const idx = (x: number, y: number) => (y * w + x) * 4;
  const ref = { r: 0, g: 0, b: 0 };
  for (const [x, y] of [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ] as const) {
    const i = idx(x, y);
    ref.r += rgba[i];
    ref.g += rgba[i + 1];
    ref.b += rgba[i + 2];
  }
  ref.r /= 4;
  ref.g /= 4;
  ref.b /= 4;

  const distAt = (i: number) => {
    const dr = rgba[i] - ref.r;
    const dg = rgba[i + 1] - ref.g;
    const db = rgba[i + 2] - ref.b;
    return Math.hypot(dr, dg, db);
  };

  const isBg = (x: number, y: number) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return false;
    return distAt(idx(x, y)) <= BG_TOL;
  };

  const mask = new Uint8Array(n);
  const q: number[] = [];

  const push = (x: number, y: number) => {
    if (!isBg(x, y)) return;
    const p = x + y * w;
    if (mask[p]) return;
    mask[p] = 1;
    q.push(p);
  };

  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  for (let qi = 0; qi < q.length; qi++) {
    const p = q[qi]!;
    const x = p % w;
    const y = (p / w) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  for (let p = 0; p < n; p++) {
    if (!mask[p]) continue;
    rgba[p * 4 + 3] = 0;
  }

  for (let p = 0; p < n; p++) {
    if (mask[p]) continue;
    const x = p % w;
    const y = (p / w) | 0;
    let adjRemoved = false;
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ] as const) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      if (mask[nx + ny * w]) {
        adjRemoved = true;
        break;
      }
    }
    if (!adjRemoved) continue;
    const i = p * 4;
    const d = distAt(i);
    if (d <= BG_TOL) continue;
    if (d >= FEATHER_TOL) continue;
    const t = (d - BG_TOL) / (FEATHER_TOL - BG_TOL);
    rgba[i + 3] = Math.round(255 * t);
  }

  return sharp(Buffer.from(rgba), {
    raw: { width: w, height: h, channels: 4 },
  })
    .png()
    .toBuffer();
}
