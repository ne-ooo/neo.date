import type { BoundaryUnit } from '../types.js'
import { daysInMonth } from '../utils/calendar.js'
import { cloneValidDate, getValidDateTime } from '../utils/dateValidation.js'

/**
 * Get end of time unit (immutable)
 *
 * @param date - Date to operate on
 * @param unit - Time unit
 * @returns New Date at end of unit
 *
 * @example
 * ```ts
 * const date = new Date(2025, 0, 15, 15, 30, 45, 123)
 *
 * endOf(date, 'day')
 * // Jan 15, 2025 at 23:59:59.999 local time
 *
 * endOf(date, 'month')
 * // Jan 31, 2025 at 23:59:59.999 local time
 *
 * endOf(date, 'year')
 * // Dec 31, 2025 at 23:59:59.999 local time
 * ```
 */
export function endOf(
  date: Date,
  unit: BoundaryUnit
): Date {
  const result = cloneValidDate(date)

  switch (unit) {
    case 'year':
      result.setMonth(11, 31)
      result.setHours(23, 59, 59, 999)
      break
    case 'month': {
      result.setDate(daysInMonth(result.getFullYear(), result.getMonth()))
      result.setHours(23, 59, 59, 999)
      break
    }
    case 'day':
      result.setHours(23, 59, 59, 999)
      break
    case 'hour':
      result.setMinutes(59, 59, 999)
      break
    case 'minute':
      result.setSeconds(59, 999)
      break
    case 'second':
      result.setMilliseconds(999)
      break
  }

  getValidDateTime(result, 'result')
  return result
}
