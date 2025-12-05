export const TS_MAX_TOP_DELAY_POD = 30;
export const TS_MAX_TOP_DELAY_EPOD = 30;
export const TS_MAX_TOP_DELAY = 45;

/**
 * Calculate Term of Payment (TOP) result
 *
 * @param baselineTop Baseline TOP in days (from transporter)
 * @param podLateDays Physical POD late days (can be negative)
 * @param epodLateDays Electronic POD late days (can be negative)
 * @returns Final TOP result in days
 */
export function calculateTopResult(
  baselineTop: number,
  podLateDays: number,
  epodLateDays: number
): number {
  const normalizedPod = Math.max(0, podLateDays);
  const normalizedEpod = Math.max(0, epodLateDays);

  const podDelay = Math.min(normalizedPod, TS_MAX_TOP_DELAY_POD);
  const epodDelay = Math.min(normalizedEpod, TS_MAX_TOP_DELAY_EPOD);

  const penalty = podDelay + epodDelay;
  const totalTop = baselineTop + penalty;

  return Math.min(totalTop, TS_MAX_TOP_DELAY);
}
