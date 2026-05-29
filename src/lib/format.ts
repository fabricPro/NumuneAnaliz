export const fmt = (n: number, d = 2): string =>
  (isFinite(n) ? n : 0).toLocaleString("tr-TR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
