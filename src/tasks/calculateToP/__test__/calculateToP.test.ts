// src/top/__tests__/calculateTopResult.test.ts
import { calculateTopResult } from "../index.js";

interface TopTestCase {
  name: string;
  baselineTop: number;
  podLateDays: number;
  epodLateDays: number;
  expected: number;
}

const cases: TopTestCase[] = [
  {
    name: "1. Basic calculation: 7 + 5 + 3 = 15",
    baselineTop: 7,
    podLateDays: 5,
    epodLateDays: 3,
    expected: 15,
  },
  {
    name: "2. POD capped at 30, total exceeds 45 → final 45",
    baselineTop: 10,
    podLateDays: 35,
    epodLateDays: 25,
    expected: 45,
  },
  {
    name: "3. Both delays at max, total exceeds 45 → final 45",
    baselineTop: 20,
    podLateDays: 30,
    epodLateDays: 30,
    expected: 45,
  },
  {
    name: "4. No penalty, baseline only",
    baselineTop: 14,
    podLateDays: 0,
    epodLateDays: 0,
    expected: 14,
  },
  {
    name: "5. Negative POD treated as 0",
    baselineTop: 5,
    podLateDays: -2,
    epodLateDays: 0,
    expected: 5,
  },
  {
    name: "6. Total exceeds max cap → 45",
    baselineTop: 15,
    podLateDays: 20,
    epodLateDays: 15,
    expected: 45,
  },
  {
    name: "7. POD at max, ePOD zero, total under 45",
    baselineTop: 10,
    podLateDays: 30,
    epodLateDays: 0,
    expected: 40,
  },
  {
    name: "8. Baseline already at max, no penalty",
    baselineTop: 45,
    podLateDays: 0,
    epodLateDays: 0,
    expected: 45,
  },
];

describe("calculateTopResult", () => {
  cases.forEach((tc) => {
    it(tc.name, () => {
      const result = calculateTopResult(
        tc.baselineTop,
        tc.podLateDays,
        tc.epodLateDays
      );
      expect(result).toBe(tc.expected);
    });
  });
});
