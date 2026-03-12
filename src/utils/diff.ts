/**
 * Calculate difference between dates
 *
 * @param dateLeft - Later date
 * @param dateRight - Earlier date
 * @param unit - Unit to return difference in
 * @returns Difference in specified unit
 *
 * @example
 * ```ts
 * const date1 = new Date('2025-01-15')
 * const date2 = new Date('2025-01-20')
 *
 * diff(date2, date1, 'days')
 * // 5
 *
 * diff(date2, date1, 'hours')
 * // 120
 *
 * diff(date1, date2, 'days')
 * // -5 (negative because date1 is earlier)
 * ```
 */
export function diff(
  dateLeft: Date,
  dateRight: Date,
  unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'
): number {
  const diffMs = dateLeft.getTime() - dateRight.getTime()

  switch (unit) {
    case 'years':
      return dateLeft.getFullYear() - dateRight.getFullYear()
    case 'months':
      return (
        (dateLeft.getFullYear() - dateRight.getFullYear()) * 12 +
        (dateLeft.getMonth() - dateRight.getMonth())
      )
    case 'days':
      return Math.floor(diffMs / (1000 * 60 * 60 * 24))
    case 'hours':
      return Math.floor(diffMs / (1000 * 60 * 60))
    case 'minutes':
      return Math.floor(diffMs / (1000 * 60))
    case 'seconds':
      return Math.floor(diffMs / 1000)
    case 'milliseconds':
      return diffMs
    default:
      throw new Error(`Invalid unit: ${unit}`)
  }
}
