import type { Duration } from '../types.js'

/**
 * Add duration to date (immutable)
 *
 * @param date - Date to add to
 * @param duration - Duration to add
 * @returns New Date with duration added
 *
 * @example
 * ```ts
 * const date = new Date('2025-01-15')
 *
 * add(date, { days: 7 })
 * // Date: 2025-01-22
 *
 * add(date, { hours: 2, minutes: 30 })
 * // Date: 2025-01-15 02:30
 *
 * add(date, { months: 1, days: 5 })
 * // Date: 2025-02-20
 * ```
 */
export function add(date: Date, duration: Duration): Date {
  const result = new Date(date.getTime())

  if (duration.years) {
    result.setFullYear(result.getFullYear() + duration.years)
  }
  if (duration.months) {
    result.setMonth(result.getMonth() + duration.months)
  }
  if (duration.days) {
    result.setDate(result.getDate() + duration.days)
  }
  if (duration.hours) {
    result.setHours(result.getHours() + duration.hours)
  }
  if (duration.minutes) {
    result.setMinutes(result.getMinutes() + duration.minutes)
  }
  if (duration.seconds) {
    result.setSeconds(result.getSeconds() + duration.seconds)
  }
  if (duration.milliseconds) {
    result.setMilliseconds(result.getMilliseconds() + duration.milliseconds)
  }

  return result
}
