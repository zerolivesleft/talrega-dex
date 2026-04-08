import path from "path";
import sharp from "sharp";

/** Fallback when the paired front sprite is missing or unreadable. */
export const DEFAULT_SPRITE_BOX = 64;

export type SpriteBox = {
  w: number;
  h: number;
  contentW: number;
  contentH: number;
  /** Top-left of opaque content within the full canvas (from Sharp trim metadata). */
  offsetLeft: number;
  offsetTop: number;
};

/**
 * Reads canvas dimensions, trimmed content size, and content position from a
 * `public/...` path stored in `Pokemon.imageUrl`.
 */
export async function getSpriteBoxFromPublicImageUrl(imageUrl: string): Promise<SpriteBox> {
  const fallback: SpriteBox = {
    w: DEFAULT_SPRITE_BOX,
    h: DEFAULT_SPRITE_BOX,
    contentW: DEFAULT_SPRITE_BOX,
    contentH: DEFAULT_SPRITE_BOX,
    offsetLeft: 0,
    offsetTop: 0,
  };
  if (!imageUrl.startsWith("/images/")) return fallback;
  const abs = path.resolve(__dirname, "../public", imageUrl.slice(1));
  try {
    const m = await sharp(abs).metadata();
    if (m.width && m.height && m.width > 0 && m.height > 0) {
      let contentW = m.width;
      let contentH = m.height;
      let offsetLeft = 0;
      let offsetTop = 0;
      try {
        const trimInfo = await sharp(abs).ensureAlpha().trim().toBuffer({ resolveWithObject: true });
        contentW = trimInfo.info.width;
        contentH = trimInfo.info.height;
        const tol = trimInfo.info.trimOffsetLeft ?? 0;
        const tot = trimInfo.info.trimOffsetTop ?? 0;
        offsetLeft = Math.abs(tol);
        offsetTop = Math.abs(tot);
      } catch {
        /* fully-transparent or untrimable */
      }
      return { w: m.width, h: m.height, contentW, contentH, offsetLeft, offsetTop };
    }
  } catch {
    /* placeholder or corrupt */
  }
  return fallback;
}

const MIN_SHINY_CANVAS = 192;

/**
 * Trims transparent border from the shiny, scales its content to match the
 * normal sprite's content proportion of the canvas, and places it
 * the same top-left position as the normal sprite's content (scaled), on a
 * canvas that's at least `MIN_SHINY_CANVAS` px.
 *
 * - `pixel`: PokéAPI-style — nearest-neighbor when scaling.
 * - `artwork`: Sheet embeds — Mitchell kernel for smoother downsampling.
 */
export async function normalizeShinyToMatchSpritePng(
  png: Buffer,
  kind: "pixel" | "artwork",
  box: SpriteBox,
): Promise<Buffer> {
  const scale = Math.max(1, Math.ceil(MIN_SHINY_CANVAS / Math.max(box.w, box.h)));
  const targetW = box.w * scale;
  const targetH = box.h * scale;

  const targetContentW = box.contentW * scale;
  const targetContentH = box.contentH * scale;

  let trimmed: Buffer;
  try {
    trimmed = await sharp(png).ensureAlpha().trim().toBuffer();
  } catch {
    trimmed = png;
  }

  const kernel = kind === "pixel" ? sharp.kernel.nearest : sharp.kernel.mitchell;

  const resized = await sharp(trimmed)
    .ensureAlpha()
    .resize(targetContentW, targetContentH, {
      fit: "contain",
      kernel,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  const left = box.offsetLeft * scale;
  const top = box.offsetTop * scale;

  return sharp({
    create: {
      width: targetW,
      height: targetH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();
}
