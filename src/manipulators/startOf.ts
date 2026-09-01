import type { BoundaryUnit } from '../types.js'
import {
  alignSubDayBoundary,
  getLocalOffsetMilliseconds,
} from '../utils/boundary.js'
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
    case 'hour': {
      const inputTimestamp = result.getTime()
      const inputOffset = getLocalOffsetMilliseconds(result)
      result.setMinutes(0, 0, 0)
      return alignSubDayBoundary(
        result,
        inputTimestamp,
        inputOffset,
        'hour',
        'start'
      )
    }
    case 'minute': {
      const inputTimestamp = result.getTime()
      const inputOffset = getLocalOffsetMilliseconds(result)
      result.setSeconds(0, 0)
      return alignSubDayBoundary(
        result,
        inputTimestamp,
        inputOffset,
        'minute',
        'start'
      )
    }
    case 'second': {
      const inputTimestamp = result.getTime()
      const inputOffset = getLocalOffsetMilliseconds(result)
      result.setMilliseconds(0)
      return alignSubDayBoundary(
        result,
        inputTimestamp,
        inputOffset,
        'second',
        'start'
      )
    }
    default:
      throw new RangeError('Invalid boundary unit')
  }

  getValidDateTime(result, 'result')
  return result
}
