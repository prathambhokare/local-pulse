export function formatPrice(price: number, priceUnit: string | null): string {
  const unit = priceUnit?.trim().replace(/^per\s+/i, "");
  const hasMeaningfulUnit = unit && !/^\d+(?:[.,]\d+)?$/.test(unit);

  return hasMeaningfulUnit ? `₹${price} per ${unit}` : `₹${price} · unit not specified`;
}