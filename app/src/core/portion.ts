/** A serving multiplier as a plain fraction: 0.75 -> "¾", 1.25 -> "1¼". */
export function portionText(m: number): string {
  const whole = Math.floor(m + 1e-9);
  const frac = Math.round((m - whole) * 4);
  const glyph = ['', '¼', '½', '¾'][frac % 4] ?? '';
  const w = frac === 4 ? whole + 1 : whole;
  if (w === 0) return glyph || '0';
  return `${w}${glyph}`;
}
