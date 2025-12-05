import { MONTH_MAP, pad2, stripFormatting } from "../helper.js";
import { DATE_REGEX_PATTERN, NUMERIC_MONTH_REGEX } from "../regex.helper.js";

/**
 * fungsi untuk mengambil format tanggal/ waktu dari text dan mengembalikan string dengan type date ISO date
 * contoh:
 *  - "Rabu, 23 Oktober 2024"
 *  - "20 Feb 25"
 *  - "11 Okt 2024"
 *  - "08 10 2024" (bulan dengan tipe nomor)
 *  - "8 Okt 24" (tanggal tanpa leading 0)
 *  - "18 9 24" (bulan dengan tipe nomor tanpa leading 0)
 */
export function parseIndonesianDateFromLine(line: string): string | null {
  const clean = stripFormatting(line)
    // menghapus nama hari dan koma jika ada serta menghilangkan space jika tidak ada kata sebelum/ setelah
    .replace(/^(senin|selasa|rabu|kamis|jumat|jum'at|sabtu|minggu)\s*,?/i, "")
    .trim();

  const monthName = Object.keys(MONTH_MAP)
    .sort((a, b) => b.length - a.length)
    .join("|");

  // regex untuk mengecek pola seperti: "23 Oktober 2024" / "23 Okt 24" / "23 10 2024"
  const dateRegex = DATE_REGEX_PATTERN(monthName);
  const m = clean.match(dateRegex);
  if (!m) return null;

  const day = parseInt(m[1], 10);
  const monthToken = m[2].toLowerCase();
  const yearToken = m[3];

  let month: number;
  // jika bulan angka
  if (NUMERIC_MONTH_REGEX.test(monthToken)) {
    month = parseInt(monthToken, 10);
  } else {
    // menghilangkan case sensitive untuk nama bulan
    const key = monthToken.toLowerCase();
    month = MONTH_MAP[key];
  }

  if (!month || day < 1 || day > 31) return null;

  let year = parseInt(yearToken, 10);
  if (year < 100) {
    // jika tahun ditulis dalam bentuk 2 angka maka tahun tersebut ditambah abad dalam satuan ribuan saat ini
    year += 2000;
  }

  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/**
 * helper untuk mengambil tanggal PO, dan mengembalikan tanggal atau undefined untuk kebutuhan field yang tidak akan diinput
 * Contoh:
 *  Jika PO terbaca, maka tambahkan field poDate: "2025-09-18"
 *  Jika PO tidak terbaca, maka hilangkan field poDate
 */
export function extractPoDateFromText(text: string): string | undefined {
  const iso = parseIndonesianDateFromLine(text);
  return iso ?? undefined;
}
