import type { Duration } from '../types.js'
import { normalizeDuration } from '../utils/duration.js'
import { add } from './add.js'

/**
 * Subtract duration from date (immutable)
 *
 * @param date - Date to subtract from
 * @param duration - Duration to subtract
 * @returns New Date with duration subtracted
 *
 * @example
 * ```ts
 * const date = new Date('2025-01-15')
 *
 * subtract(date, { days: 7 })
 * // Date: 2025-01-08
 *
 * subtract(date, { months: 1 })
 * // Date: 2024-12-15
 * ```
 */
export function subtract(date: Date, duration: Duration): Date {
  const normalized = normalizeDuration(duration)
  const negated: Duration = {
    years: -normalized.years,
    months: -normalized.months,
    days: -normalized.days,
    hours: -normalized.hours,
    minutes: -normalized.minutes,
    seconds: -normalized.seconds,
    milliseconds: -normalized.milliseconds,
  }

  return add(date, negated)
}
