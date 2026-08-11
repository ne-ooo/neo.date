import type { BoundaryUnit } from '../types.js'
import { cloneValidDate, getValidDateTime } from '../utils/dateValidation.js'

/**
 * Get start of time unit (immutable)
 *
 * @param date - Date to operate on
 * @param unit - Time unit ('year', 'month', 'day', 'hour', 'minute', 'second')
 * @returns New Date at start of unit
 *
 * @example
 * ```ts
 * const date = new Date(2025, 0, 15, 15, 30, 45, 123)
 *
 * startOf(date, 'day')
 * // Jan 15, 2025 at 00:00:00.000 local time
 *
 * startOf(date, 'month')
 * // Jan 1, 2025 at 00:00:00.000 local time
 *
 * startOf(date, 'year')
 * // Jan 1, 2025 at 00:00:00.000 local time
 * ```
 */
export function startOf(
  date: Date,
  unit: BoundaryUnit
): Date {
  const result = cloneValidDate(date)

  switch (unit) {
    case 'year':
      result.setMonth(0, 1)
      result.setHours(0, 0, 0, 0)
      break
    case 'month':
      result.setDate(1)
      result.setHours(0, 0, 0, 0)
      break
    case 'day':
      result.setHours(0, 0, 0, 0)
      break
    case 'hour':
      result.setMinutes(0, 0, 0)
      break
    case 'minute':
      result.setSeconds(0, 0)
      break
    case 'second':
      result.setMilliseconds(0)
      break
  }

  getValidDateTime(result, 'result')
  return result
}
