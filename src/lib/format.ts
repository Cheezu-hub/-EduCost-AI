export function fmt(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function fmtPct(n: number) {
  return `${n.toFixed(1)}%`;
}

export function fmtMonths(m: number) {
  if (m < 12) return `${Math.round(m)} mo`;
  const years = Math.floor(m / 12);
  const months = Math.round(m % 12);
  return months > 0 ? `${years}y ${months}mo` : `${years} years`;
}
