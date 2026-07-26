/** Formats a countdown like "Expires in 3h 20m" or "Expired" for a given ISO instant. */
export function timeLeftLabel(expiresAtIso: string): string {
  const expiresAt = new Date(expiresAtIso).getTime();
  const diffMs = expiresAt - Date.now();
  if (diffMs <= 0) {
    return "Expired";
  }
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 1) {
    return `Expires in ${hours}h ${minutes}m`;
  }
  return `Expires in ${minutes}m`;
}
