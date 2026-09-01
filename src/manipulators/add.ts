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
  const calendarMonths = combineCalendarMonths(
    normalized.years,
    normalized.months
  )

  if (calendarMonths !== 0) {
    const originalDay = result.getDate()
    const targetMonthIndex = result.getMonth() + calendarMonths
    const targetYear = result.getFullYear() + Math.floor(targetMonthIndex / 12)
    const targetMonth = ((targetMonthIndex % 12) + 12) % 12

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

  const elapsedMilliseconds = combineElapsedMilliseconds(normalized)

  if (elapsedMilliseconds === 0) return result

  const finalResult = new Date(result.getTime() + elapsedMilliseconds)
  getValidDateTime(finalResult, 'result')
  return finalResult
}

function combineCalendarMonths(years: number, months: number): number {
  const scaledYears = years * 12
  const combined = scaledYears + months

  if (Number.isSafeInteger(scaledYears) && Number.isSafeInteger(combined)) {
    return combined
  }

  return toSafeNumber(
    BigInt(years) * 12n + BigInt(months),
    'combined years and months exceed the safe integer range'
  )
}

function combineElapsedMilliseconds(
  duration: ReturnType<typeof normalizeDuration>
): number {
  const hours = duration.hours * 3_600_000
  const minutes = duration.minutes * 60_000
  const seconds = duration.seconds * 1_000
  const hoursAndMinutes = hours + minutes
  const throughSeconds = hoursAndMinutes + seconds
  const combined = throughSeconds + duration.milliseconds

  if (
    Number.isSafeInteger(hours) &&
    Number.isSafeInteger(minutes) &&
    Number.isSafeInteger(seconds) &&
    Number.isSafeInteger(hoursAndMinutes) &&
    Number.isSafeInteger(throughSeconds) &&
    Number.isSafeInteger(combined)
  ) {
    return combined
  }

  return toSafeNumber(
    BigInt(duration.hours) * 3_600_000n +
      BigInt(duration.minutes) * 60_000n +
      BigInt(duration.seconds) * 1_000n +
      BigInt(duration.milliseconds),
    'combined sub-day duration exceeds the safe integer range'
  )
}

function toSafeNumber(value: bigint, message: string): number {
  if (
    value < BigInt(Number.MIN_SAFE_INTEGER) ||
    value > BigInt(Number.MAX_SAFE_INTEGER)
  ) {
    throw new RangeError(message)
  }
  return Number(value)
}
