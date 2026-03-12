import type { RelativeTimeOptions } from '../types.js'

/**
 * Format date as relative time ("2 hours ago", "in 3 days")
 *
 * Uses Intl.RelativeTimeFormat for locale-aware relative formatting
 *
 * @param date - Date to format
 * @param baseDate - Base date to compare against (defaults to now)
 * @param options - Relative time options
 * @returns Relative time string
 *
 * @example
 * ```ts
 * const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
 * formatRelative(twoHoursAgo)
 * // '2 hours ago'
 *
 * const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
 * formatRelative(tomorrow)
 * // 'in 1 day'
 *
 * formatRelative(twoHoursAgo, new Date(), {
 *   locale: 'es',
 *   style: 'long'
 * })
 * // 'hace 2 horas'
 * ```
 */
export function formatRelative(
  date: Date,
  baseDate: Date = new Date(),
  options: RelativeTimeOptions = {}
): string {
  const { locale = 'en-US', style = 'long' } = options

  const diffMs = date.getTime() - baseDate.getTime()

  // Calculate each unit independently from milliseconds
  // Use Math.round() to handle both positive and negative differences correctly
  const diffSeconds = Math.round(diffMs / 1000)
  const diffMinutes = Math.round(diffMs / (1000 * 60))
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  const diffWeeks = Math.round(diffMs / (1000 * 60 * 60 * 24 * 7))
  const diffMonths = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30))
  const diffYears = Math.round(diffMs / (1000 * 60 * 60 * 24 * 365))

  const rtf = new Intl.RelativeTimeFormat(locale, { style, numeric: 'auto' })

  if (Math.abs(diffYears) >= 1) {
    return rtf.format(diffYears, 'year')
  }
  if (Math.abs(diffMonths) >= 1) {
    return rtf.format(diffMonths, 'month')
  }
  if (Math.abs(diffWeeks) >= 1) {
    return rtf.format(diffWeeks, 'week')
  }
  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, 'day')
  }
  if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, 'hour')
  }
  if (Math.abs(diffMinutes) >= 1) {
    return rtf.format(diffMinutes, 'minute')
  }
  return rtf.format(diffSeconds, 'second')
}
