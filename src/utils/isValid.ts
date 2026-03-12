/**
 * Check if date is valid
 *
 * @param date - Date to validate
 * @returns true if valid, false otherwise
 *
 * @example
 * ```ts
 * isValid(new Date())
 * // true
 *
 * isValid(new Date('invalid'))
 * // false
 *
 * isValid(new Date('2025-01-15'))
 * // true
 * ```
 */
export function isValid(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}
