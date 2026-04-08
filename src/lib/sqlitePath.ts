import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Resolves the SQLite file path from `DATABASE_URL` (same rules as Prisma CLI)
 * or defaults to `dev.db` at the project root.
 */
export function resolveSqliteFilePath(): string {
  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  if (dbUrl.startsWith("file:")) {
    return fileURLToPath(new URL(dbUrl, pathToFileURL(path.join(process.cwd(), "package.json"))));
  }
  return path.resolve(process.cwd(), dbUrl);
}
