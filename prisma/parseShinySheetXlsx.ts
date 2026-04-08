/**
 * Extract shiny artwork embedded in the Talrega shiny Google Sheet (.xlsx).
 * CSV export does not include images; the xlsx contains xl/media/*.png + drawing anchors.
 */

import JSZip from "jszip";

/** 0-based column index → Excel letters (A=0). */
export function colIndexToLetters(zeroBased: number): string {
  let n = zeroBased + 1;
  let s = "";
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

function parseSharedStrings(xml: string): string[] {
  const out: string[] = [];
  const parts = xml.split("<si>");
  for (let i = 1; i < parts.length; i++) {
    const block = parts[i]!.split("</si>")[0] ?? "";
    const direct = /<t[^>]*>([^<]*)<\/t>/.exec(block);
    if (direct?.[1] !== undefined) {
      out.push(direct[1]);
      continue;
    }
    const rich = [...block.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((m) => m[1]).join("");
    out.push(rich);
  }
  return out;
}

function parseSheetCells(xml: string, strings: string[]): Map<string, string> {
  const map = new Map<string, string>();
  /** Self-closing `<c .../>` must not use `[^>]*>` or the `/` is swallowed and the next cell is eaten. */
  const re = /<c r="([A-Z]+)(\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const col = m[1]!;
    const row = m[2]!;
    const attrs = m[3]!;
    const inner = m[4];
    const ref = `${col}${row}`;
    if (inner === undefined) continue;
    if (attrs.includes('t="s"')) {
      const vm = /<v>(\d+)<\/v>/.exec(inner);
      if (vm) map.set(ref, strings[parseInt(vm[1]!, 10)] ?? "");
    } else {
      const vm = /<v>([^<]*)<\/v>/.exec(inner);
      if (vm) map.set(ref, vm[1]!);
    }
  }
  return map;
}

function findRowsWhereColumnAIs(cellMap: Map<string, string>, value: string): number[] {
  const rows = new Set<number>();
  const upper = value.toUpperCase();
  for (const [ref, v] of cellMap) {
    if (/^A\d+$/.test(ref) && v.trim().toUpperCase() === upper) {
      rows.add(parseInt(ref.slice(1), 10));
    }
  }
  return [...rows].sort((a, b) => a - b);
}

/** Parse xl/drawings/_rels/drawing1.xml.rels → rId → media/imageN.png (path inside zip under xl/). */
function parseDrawingRels(xml: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /Id="([^"]+)"[^>]*Target="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    let p = m[2]!;
    if (p.startsWith("../")) p = p.slice(3);
    if (p.startsWith("media/")) map.set(m[1]!, `xl/${p}`);
  }
  return map;
}

export type DrawingAnchor = { col: number; row: number; embed: string };

/** oneCellAnchor / twoCellAnchor: first <xdr:from> col/row + r:embed on that picture. */
export function parseDrawingAnchors(drawingXml: string): DrawingAnchor[] {
  const out: DrawingAnchor[] = [];
  const blocks = drawingXml.split(/<xdr:(?:one|two)CellAnchor/);
  for (const b of blocks.slice(1)) {
    const from = b.indexOf("<xdr:from>");
    if (from === -1) continue;
    const seg = b.slice(from, from + 400);
    const col = /<xdr:col>(\d+)<\/xdr:col>/.exec(seg);
    const row = /<xdr:row>(\d+)<\/xdr:row>/.exec(seg);
    const embed = /r:embed="(rId\d+)"/.exec(b);
    if (col && row && embed) {
      out.push({ col: parseInt(col[1]!, 10), row: parseInt(row[1]!, 10), embed: embed[1]! });
    }
  }
  return out;
}

function slugifySheetHeader(cell: string): string {
  return cell
    .trim()
    .toLowerCase()
    .replace(/[''´`]/g, "'")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * For each row whose column A is "SHINY", OOXML image row = Excel row − 1,
 * species names sit two rows above (same column as anchor).
 */
export async function extractShinyPngsBySlugFromXlsxBuffer(xlsxBuffer: Buffer): Promise<Map<string, Buffer>> {
  const zip = await JSZip.loadAsync(xlsxBuffer);
  const ssFile = zip.file("xl/sharedStrings.xml");
  const sheetFile = zip.file("xl/worksheets/sheet1.xml");
  const drawingFile = zip.file("xl/drawings/drawing1.xml");
  const relsFile = zip.file("xl/drawings/_rels/drawing1.xml.rels");
  if (!ssFile || !sheetFile || !drawingFile || !relsFile) {
    throw new Error("Shiny xlsx is missing xl/sharedStrings, sheet1, or drawing parts.");
  }

  const strings = parseSharedStrings(await ssFile.async("string"));
  const cellMap = parseSheetCells(await sheetFile.async("string"), strings);
  const shinyExcelRows = findRowsWhereColumnAIs(cellMap, "SHINY");
  const rIdToPath = parseDrawingRels(await relsFile.async("string"));
  const anchors = parseDrawingAnchors(await drawingFile.async("string"));

  const shinyRowSet = new Set(shinyExcelRows);
  const out = new Map<string, Buffer>();

  for (const a of anchors) {
    if (a.col < 1) continue;
    const shinyExcelRow = a.row + 1;
    if (!shinyRowSet.has(shinyExcelRow)) continue;
    const speciesRow = shinyExcelRow - 2;
    const speciesLetters = colIndexToLetters(a.col);
    const ref = `${speciesLetters}${speciesRow}`;
    const raw = cellMap.get(ref)?.trim();
    if (!raw) continue;
    const slug = slugifySheetHeader(raw);
    const zipPath = rIdToPath.get(a.embed);
    if (!zipPath) continue;
    const imgFile = zip.file(zipPath);
    if (!imgFile) continue;
    const buf = (await imgFile.async("nodebuffer")) as Buffer;
    out.set(slug, buf);
  }

  return out;
}
