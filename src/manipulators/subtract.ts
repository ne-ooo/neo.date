import type { Duration } from '../types.js'
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
  const negated: Duration = {}

  if (duration.years) negated.years = -duration.years
  if (duration.months) negated.months = -duration.months
  if (duration.days) negated.days = -duration.days
  if (duration.hours) negated.hours = -duration.hours
  if (duration.minutes) negated.minutes = -duration.minutes
  if (duration.seconds) negated.seconds = -duration.seconds
  if (duration.milliseconds) negated.milliseconds = -duration.milliseconds

  return add(date, negated)
}
