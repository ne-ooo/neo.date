/**
 * Get start of time unit (immutable)
 *
 * @param date - Date to operate on
 * @param unit - Time unit ('year', 'month', 'day', 'hour', 'minute', 'second')
 * @returns New Date at start of unit
 *
 * @example
 * ```ts
 * const date = new Date('2025-01-15T15:30:45.123Z')
 *
 * startOf(date, 'day')
 * // 2025-01-15T00:00:00.000Z
 *
 * startOf(date, 'month')
 * // 2025-01-01T00:00:00.000Z
 *
 * startOf(date, 'year')
 * // 2025-01-01T00:00:00.000Z
 * ```
 */
export function startOf(
  date: Date,
  unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
): Date {
  const result = new Date(date.getTime())

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

  return result
}
