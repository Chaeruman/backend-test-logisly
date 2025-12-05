import { ORIGIN_REGEX, SAFETY_NOTE_REGEX } from "./utils/regex.helper.js";
import type { CargoItem, ParsedMessage } from "./types.js";
import { isCargoLine, stripFormatting } from "./utils/helper.js";
import { parseIndonesianDateFromLine } from "./utils/parser/indonesianDate.js";
import { parseCargoLine } from "./utils/parser/cargoLine.js";

export function WhatsappCargoMessageParser(raw: string): ParsedMessage {
  const lines = raw.split(/\r?\n/);

  let date: string | null = null;
  let origin = "";
  const items: CargoItem[] = [];
  let safetyNote: string | undefined;

  let originFound = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const clean = stripFormatting(line);

    if (!clean) continue;

    // 1) mengecek tanggal pertama yang diinput di header
    if (!date) {
      const maybeDate = parseIndonesianDateFromLine(clean);
      if (maybeDate) {
        date = maybeDate;
        continue;
      }
    }

    // 2) mengecek origin
    if (!origin && /origin/i.test(clean)) {
      const m = clean.match(ORIGIN_REGEX);
      origin = (m ? m[1] : clean).trim();
      originFound = true;
      continue;
    }

    // 2) mengecek safety note
    if (!safetyNote && SAFETY_NOTE_REGEX.test(clean)) {
      let full = clean;
      const next = stripFormatting(lines[i + 1] ?? "");
      // memeriksa terlebih dahulu jika baris setelah nya bukan merupakan teks terima kasih atau sejenis item cargo, jika bukan maka teks safetynya digabung
      if (
        next &&
        !/terima\s+kasih/i.test(next) &&
        !isCargoLine(lines[i + 1] ?? "")
      ) {
        full = `${full} ${next}`;
      }
      safetyNote = full;
      continue;
    }

    // 4) memeriksa jika baris yang dicek adalah cargo
    if (originFound && isCargoLine(line)) {
      const item = parseCargoLine(line);
      if (item) items.push(item);
      continue;
    }
  }

  if (!date) {
    throw new Error("Could not detect date from message");
  }
  if (!origin) {
    throw new Error("Could not detect origin from message");
  }

  return {
    date,
    origin,
    items,
    safetyNote,
  };
}
