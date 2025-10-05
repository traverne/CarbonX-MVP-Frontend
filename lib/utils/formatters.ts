export function formatVET(wei: string | bigint): string {
  const n = typeof wei === "bigint" ? wei : BigInt(wei)
  // 1e18
  const whole = n / 10n ** 18n
  const frac = n % 10n ** 18n
  const fracStr = frac.toString().padStart(18, "0").slice(0, 4)
  return `${whole.toString()}.${fracStr} VET`
}

export function formatTimeLeft(ts: number): string {
  const now = Math.floor(Date.now() / 1000)
  const d = ts - now
  if (d <= 0) return "expired"
  const h = Math.floor(d / 3600)
  const m = Math.floor((d % 3600) / 60)
  return `${h}h ${m}m`
}
