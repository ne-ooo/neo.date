/**
 * Compare two dates
 *
 * @param dateLeft - First date
 * @param dateRight - Second date
 * @returns -1 if left < right, 0 if equal, 1 if left > right
 *
 * @example
 * ```ts
 * const date1 = new Date('2025-01-15')
 * const date2 = new Date('2025-01-20')
 *
 * compare(date1, date2) // -1
 * compare(date2, date1) // 1
 * compare(date1, date1) // 0
 * ```
 */
export function compare(dateLeft: Date, dateRight: Date): number {
  const diff = dateLeft.getTime() - dateRight.getTime()

  if (diff < 0) return -1
  if (diff > 0) return 1
  return 0
}

/**
 * Check if dates are equal
 *
 * @param dateLeft - First date
 * @param dateRight - Second date
 * @returns true if dates are equal, false otherwise
 *
 * @example
 * ```ts
 * const date1 = new Date('2025-01-15')
 * const date2 = new Date('2025-01-15')
 *
 * isEqual(date1, date2) // true
 * ```
 */
export function isEqual(dateLeft: Date, dateRight: Date): boolean {
  return compare(dateLeft, dateRight) === 0
}

/**
 * Check if date is before another
 *
 * @param date - Date to check
 * @param dateToCompare - Date to compare against
 * @returns true if date is before dateToCompare
 *
 * @example
 * ```ts
 * const date1 = new Date('2025-01-15')
 * const date2 = new Date('2025-01-20')
 *
 * isBefore(date1, date2) // true
 * isBefore(date2, date1) // false
 * ```
 */
export function isBefore(date: Date, dateToCompare: Date): boolean {
  return compare(date, dateToCompare) === -1
}

/**
 * Check if date is after another
 *
 * @param date - Date to check
 * @param dateToCompare - Date to compare against
 * @returns true if date is after dateToCompare
 *
 * @example
 * ```ts
 * const date1 = new Date('2025-01-15')
 * const date2 = new Date('2025-01-20')
 *
 * isAfter(date2, date1) // true
 * isAfter(date1, date2) // false
 * ```
 */
export function isAfter(date: Date, dateToCompare: Date): boolean {
  return compare(date, dateToCompare) === 1
}
