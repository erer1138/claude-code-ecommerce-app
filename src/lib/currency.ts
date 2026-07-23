const thbFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPriceTHB(price: string | number): string {
  const numeric = typeof price === "string" ? Number(price) : price;
  return thbFormatter.format(Number.isFinite(numeric) ? numeric : 0);
}
