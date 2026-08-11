import type { Duration } from '../types.js'
import { daysInMonth } from '../utils/calendar.js'
import { cloneValidDate, getValidDateTime } from '../utils/dateValidation.js'
import { normalizeDuration } from '../utils/duration.js'

/**
 * Add duration to date (immutable).
 * Years/months clamp, days use local calendar time, and sub-day units use elapsed time.
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
  const result = cloneValidDate(date)
  const normalized = normalizeDuration(duration)
  const calendarMonths = normalized.years * 12 + normalized.months

  if (!Number.isSafeInteger(calendarMonths)) {
    throw new RangeError('combined years and months exceed the safe integer range')
  }

  if (calendarMonths !== 0) {
    const originalDay = result.getDate()
    const targetMonthIndex = result.getMonth() + calendarMonths
    const targetYear = result.getFullYear() + Math.floor(targetMonthIndex / 12)
    const targetMonth = ((targetMonthIndex % 12) + 12) % 12

    result.setDate(1)
    result.setFullYear(
      targetYear,
      targetMonth,
      Math.min(originalDay, daysInMonth(targetYear, targetMonth))
    )
    getValidDateTime(result, 'result')
  }

  if (normalized.days !== 0) {
    result.setDate(result.getDate() + normalized.days)
    getValidDateTime(result, 'result')
  }

  const elapsedMilliseconds =
    normalized.hours * 3_600_000 +
    normalized.minutes * 60_000 +
    normalized.seconds * 1_000 +
    normalized.milliseconds

  if (!Number.isSafeInteger(elapsedMilliseconds)) {
    throw new RangeError('combined sub-day duration exceeds the safe integer range')
  }

  if (elapsedMilliseconds === 0) return result

  const finalResult = new Date(result.getTime() + elapsedMilliseconds)
  getValidDateTime(finalResult, 'result')
  return finalResult
}
