import {
  NOTES_IN_PARENS_REGEX,
  PO_REGEX,
  TRAILING_PUNCTUATION_REGEX,
} from "../regex.helper.js";
import type { CargoItem } from "../../types.js";
import { extractNotes, stripFormatting } from "../helper.js";
import { extractPoDateFromText } from "./indonesianDate.js";

/**
 * mem-parsing satu baris cargo menjadi struktur format CargoItem.
 *
 * items:
 *   - destinations: Array<string> dipisah dengan +
 *   - Volume CBM: number
 *   - jumlah unit: number
 *   - informasi PO (opsional)
 *   - catatan dalam kurung (Gudang, Urgent, dll) (opsional)
 *
 * Contoh:
 *   "Csa Cikupa + Rajeg 45 Cbm 1 Unit (Gudang Bayur)"
 *
 * @param rawLine baris asli dari pesan
 * @returns CargoItem atau null jika baris bukan cargo
 */
export function parseCargoLine(rawLine: string): CargoItem | null {
  let line = stripFormatting(rawLine);
  if (!line) return null;

  // mengambil tanggal po
  let poDate: string | undefined;
  const poMatch = line.match(PO_REGEX);
  if (poMatch) {
    poDate = extractPoDateFromText(poMatch[0]);
    line = line.replace(poMatch[0], "").trim();
  }

  // mengambil notes di dalam tanda kurung (Gudang, Urgent, etc.)
  const { notes: extractedNotes, cleanLine } = extractNotes(line);
  line = cleanLine;

  let notes: string | undefined;
  if (extractedNotes.length > 0) {
    notes = extractedNotes.join(" ").trim();
  }

  // mengambil volume cbm
  let volumeCbm: number | null = null;
  const volumeMatch = line.match(/(\d+)\s*cbm\b/i);
  if (volumeMatch) {
    volumeCbm = parseInt(volumeMatch[1], 10);
    line = line.replace(volumeMatch[0], "").trim();
  }

  // mengambil jumlah unit
  let unitCount: number | null = null;
  const unitMatch = line.match(/(\d+)\s*unit\b/i);
  if (unitMatch) {
    unitCount = parseInt(unitMatch[1], 10);
    line = line.replace(unitMatch[0], "").trim();
  }

  // menghapus karakter seperti koma atau . jika ada
  line = line.replace(TRAILING_PUNCTUATION_REGEX, "").trim();

  // mengambil data destinasi tempat yang dipisah dengan nama tempat
  const destinations = line
    .split(/\s*\+\s*/g)
    .map((d) => d.trim())
    .filter(Boolean);

  if (destinations.length === 0 && volumeCbm === null && unitCount === null) {
    // not a cargo line
    return null;
  }

  const item: CargoItem = {
    destinations,
    volumeCbm,
    unitCount,
  };
  if (poDate) item.poDate = poDate;
  if (notes) item.notes = notes;

  return item;
}
