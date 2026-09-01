import type { BoundaryUnit } from '../types.js'
import {
  alignSubDayBoundary,
  getLocalOffsetMilliseconds,
} from '../utils/boundary.js'
import { getValidDateTime } from '../utils/dateValidation.js'

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
  const inputTimestamp = getValidDateTime(date)

  switch (unit) {
    case 'year':
      return previousLocalBoundary(
        Date.prototype.getFullYear.call(date) + 1,
        0,
        1
      )
    case 'month':
      return previousLocalBoundary(
        Date.prototype.getFullYear.call(date),
        Date.prototype.getMonth.call(date) + 1,
        1
      )
    case 'day':
      return previousLocalBoundary(
        Date.prototype.getFullYear.call(date),
        Date.prototype.getMonth.call(date),
        Date.prototype.getDate.call(date) + 1
      )
  }

  const result = new Date(inputTimestamp)

  switch (unit) {
    case 'hour': {
      const inputOffset = getLocalOffsetMilliseconds(result)
      result.setMinutes(59, 59, 999)
      return alignSubDayBoundary(
        result,
        inputTimestamp,
        inputOffset,
        'hour',
        'end'
      )
    }
    case 'minute': {
      const inputOffset = getLocalOffsetMilliseconds(result)
      result.setSeconds(59, 999)
      return alignSubDayBoundary(
        result,
        inputTimestamp,
        inputOffset,
        'minute',
        'end'
      )
    }
    case 'second': {
      const inputOffset = getLocalOffsetMilliseconds(result)
      result.setMilliseconds(999)
      return alignSubDayBoundary(
        result,
        inputTimestamp,
        inputOffset,
        'second',
        'end'
      )
    }
    default:
      throw new RangeError('Invalid boundary unit')
  }
}

function previousLocalBoundary(
  year: number,
  month: number,
  day: number
): Date {
  let result: Date

  if (year >= 0 && year <= 99) {
    result = new Date(0)
    result.setHours(0, 0, 0, 0)
    result.setFullYear(year, month, day)
    result.setHours(0, 0, 0, 0)
  } else {
    result = new Date(year, month, day, 0, 0, 0, 0)
  }

  result.setTime(result.getTime() - 1)
  getValidDateTime(result, 'result')
  return result
}
