/** Compact money label. The hero odometer carries the exact comma form; the
 *  markers and braces carry this, so both are on screen at once. */
export const money = (n: number, cur: '₹' | '$') => {
  const a = Math.round(Math.abs(n));
  if (a < 1000) return `${cur}${a}`;
  const dec = a >= 10000 ? 1 : 2;
  const k = (a / 1000).toFixed(dec).replace(/\.?0+$/, '');
  return `${cur}${k}K`;
};
