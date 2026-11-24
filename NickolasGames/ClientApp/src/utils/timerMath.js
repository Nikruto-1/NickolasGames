// Calculate elapsed time from wall-clock timestamps, not interval callback counts.
// Browsers may throttle intervals while tabs are backgrounded or devices are busy.
/** @param {number} startedAt @param {number} now @returns {number} */
export function elapsedWholeSeconds(startedAt, now) {
  if (!Number.isFinite(startedAt) || !Number.isFinite(now) || now <= startedAt) return 0;
  return Math.floor((now - startedAt) / 1000);
}
