import { FORMATTING_MARKERS_REGEX } from "./regex.helper.js";

/**
 * Mapping nama nama bulan yang kemungkinan berbeda penulisannya
 */
export const MONTH_MAP: Record<string, number> = {
  jan: 1,
  januari: 1,
  feb: 2,
  februari: 2,
  mar: 3,
  maret: 3,
  apr: 4,
  april: 4,
  mei: 5,
  jun: 6,
  juni: 6,
  jul: 7,
  juli: 7,
  agu: 8,
  agustus: 8,
  agst: 8,
  sep: 9,
  sept: 9,
  september: 9,
  okt: 10,
  oktober: 10,
  nov: 11,
  november: 11,
  des: 12,
  desember: 12,
};

/**
 *
 * @param line string
 * @returns string baru dengan menghilangkan karakter yang biasa digunakan untuk formatting di whatsapp
 * Contoh:
 * *halo world*
 * _halo world_
 * ~halo world~
 * `halo world`
 */
export function stripFormatting(line: string): string {
  // remove whatsapp bold/italic markers, keep text
  return line.replace(FORMATTING_MARKERS_REGEX, "").trim();
}

/**
 * Fungsi untuk mengecek jika ada leading 0 dan digunakan untuk format angka bulan maupun angka tanggal
 * @param n diambil dari MONTH_MAP sesuai dengan kata yang digunakan untuk menggunakan format bulan atau day yang di parse integer
 * @returns mengembalikan string yang menambahkan leading 0 jika n kurang dari 10, atau mengembalikan n: string jika n lebih dari 10
 */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/**
 * Mengecek jika baris yang sedang dicek adalah baris item cargo
 */
export function isCargoLine(rawLine: string): boolean {
  const clean = stripFormatting(rawLine).toLowerCase();
  if (!clean) return false;
  return /\d/.test(clean) && /cbm\b/.test(clean);
}

export function extractNotes(rawLine: string): {
  notes: string[];
  cleanLine: string;
} {
  let line = stripFormatting(rawLine);
  const notes: string[] = [];

  // 1) Notes dalam kurung (Gudang Bayur)
  const paren = line.match(/\(([^)]*)\)/gi);
  if (paren) {
    paren.forEach((p) => notes.push(p.replace(/[]/g, "").trim()));
    line = line.replace(/\([^)]*\)/g, "").trim();
  }

  // 2) Notes dengan *...* atau _..._
  const formatted = [...line.matchAll(/[*_~`]([^*_~`]+)[*_~`]/gi)];
  if (formatted.length) {
    formatted.forEach((m) => notes.push(m[1].trim()));
    line = line.replace(/[*_~`]([^*_~`]+)[*_~`]/gi, "").trim();
  }

  // 3) Keyword-based notes (urgent, urgent bongkar besok, gudang bayur)
  // Customize list
  const NOTE_KEYWORDS = [
    "urgent",
    "urgent bongkar",
    "urgent bongkar besok",
    "gudang",
    "gudang bayur",
  ];

  const keywordRegex = new RegExp(
    `\\b(${NOTE_KEYWORDS.map((k) => k.replace(/\s+/g, "\\s+")).join("|")})\\b`,
    "gi"
  );

  const keywordMatches = [...line.matchAll(keywordRegex)];
  if (keywordMatches.length) {
    keywordMatches.forEach((m) => notes.push(m[1].trim()));
    line = line.replace(keywordRegex, "").trim();
  }

  return {
    notes,
    cleanLine: line.trim(),
  };
}
