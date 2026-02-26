export function formatScore(value) {
  if (value == null) return "—";
  const n = Number(value);
  return Number.isNaN(n) ? "—" : n.toFixed(1);
}

export function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString();
}
