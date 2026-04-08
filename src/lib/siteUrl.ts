/** Canonical site URL for metadata (set `NEXT_PUBLIC_SITE_URL` in production, e.g. https://your-app.vercel.app). */
export function getSiteUrl(): URL | undefined {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    try {
      return new URL(explicit);
    } catch {
      /* fall through */
    }
  }
  const vercel = process.env.VERCEL_URL;
  if (vercel) {
    try {
      return new URL(`https://${vercel}`);
    } catch {
      /* ignore */
    }
  }
  return undefined;
}
