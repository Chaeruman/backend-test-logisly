/**
 * Regex untuk mencocokkan pola tanggal Indonesia seperti "23 Oktober 2024" atau "23 10 2024".
 */
export const DATE_REGEX_PATTERN = (monthNames: string) =>
  new RegExp(`(\\d{1,2})\\s+(\\d{1,2}|${monthNames})\\s+(\\d{2,4})`, "i");

/**
 * Regex untuk mencocokkan PO date seperti "PO 11 Okt 2024" atau "PO Tgl 28 Okt 24".
 */
export const PO_REGEX =
  /\bPO\b(?:\s+(?:tgl|tanggal))?\s+(?:\d{1,2}(?:\s+[A-Za-z]+)?(?:\s+\d{2,4})?)/i;

/**
 * Regex untuk mencocokkan notes dalam kurung seperti "(Gudang Bayur)".
 */
export const NOTES_IN_PARENS_REGEX = /\([^)]*\)/g;

/**
 * Regex untuk menghapus formatting markers WhatsApp seperti *, _, ~, `.
 */
export const FORMATTING_MARKERS_REGEX = /[*_~`]/g;

/**
 * Regex untuk mendeteksi baris safety note.
 */
export const SAFETY_NOTE_REGEX =
  /(pastikan\s+(driver|supir)|driver\s+harus|supir\s+harus|gunakan\s+apd|wajib\s+memakai)/i;

/**
 * Regex untuk mendeteksi baris origin.
 */
export const ORIGIN_REGEX = /origin\s+(.+)/i;

/**
 * Regex untuk menghapus tanda baca akhir seperti . atau ,.
 */
export const TRAILING_PUNCTUATION_REGEX = /[.,]+$/g;

/**
 * Regex untuk memeriksa jika token bulan adalah numerik.
 */
export const NUMERIC_MONTH_REGEX = /^\d{1,2}$/;
