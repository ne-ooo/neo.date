/**
 * Get end of time unit (immutable)
 *
 * @param date - Date to operate on
 * @param unit - Time unit
 * @returns New Date at end of unit
 *
 * @example
 * ```ts
 * const date = new Date('2025-01-15T15:30:45.123Z')
 *
 * endOf(date, 'day')
 * // 2025-01-15T23:59:59.999Z
 *
 * endOf(date, 'month')
 * // 2025-01-31T23:59:59.999Z
 *
 * endOf(date, 'year')
 * // 2025-12-31T23:59:59.999Z
 * ```
 */
export function endOf(
  date: Date,
  unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
): Date {
  const result = new Date(date.getTime())

  switch (unit) {
    case 'year':
      result.setMonth(11, 31)
      result.setHours(23, 59, 59, 999)
      break
    case 'month': {
      // Get last day of month
      const nextMonth = new Date(
        result.getFullYear(),
        result.getMonth() + 1,
        0
      )
      result.setDate(nextMonth.getDate())
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

  return result
}
