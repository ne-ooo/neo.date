import type { FormatOptions } from '../types.js'

/**
 * Format date using Intl.DateTimeFormat
 *
 * Leverages native Intl API for locale-aware formatting
 * Zero dependencies, all formatting done natively
 *
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * format(new Date(), { dateStyle: 'medium' })
 * // 'Jan 15, 2025'
 *
 * format(new Date(), {
 *   year: 'numeric',
 *   month: 'long',
 *   day: 'numeric'
 * })
 * // 'January 15, 2025'
 *
 * format(new Date(), {
 *   timeStyle: 'short',
 *   timeZone: 'America/New_York'
 * })
 * // '3:45 PM'
 * ```
 */
export function format(date: Date, options: FormatOptions = {}): string {
  const { locale = 'en-US', ...intlOptions } = options

  const formatter = new Intl.DateTimeFormat(locale, intlOptions)
  return formatter.format(date)
}
