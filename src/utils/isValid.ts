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
export function isValid(date: unknown): date is Date {
  try {
    return Number.isFinite(Date.prototype.getTime.call(date))
  } catch {
    return false
  }
}
