import fs from "fs";
import path from "path";

export function loadSQL(filename: string): string {
  return fs.readFileSync(
    path.join(process.cwd(), "src/query", filename),
    "utf8"
  );
}
