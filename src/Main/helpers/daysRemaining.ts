export function daysRemaining(startDate: string): number {
  const start = new Date(startDate)
  const expiry = new Date(start)
  expiry.setDate(expiry.getDate() + 30)
  return Math.ceil((expiry.getTime() - Date.now()) / 86400000)
}