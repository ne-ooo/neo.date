import type { RelativeTimeOptions } from '../types.js'
import { getValidDateTime } from '../utils/dateValidation.js'
import { getRelativeTimeFormatter } from '../utils/intlFormatters.js'

const SECOND = 1_000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

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
 *   style: 'long',
 *   numeric: 'always'
 * })
 * // 'hace 2 horas'
 * ```
 */
export function formatRelative(
  date: Date,
  baseDate: Date = new Date(),
  options: RelativeTimeOptions = {}
): string {
  const {
    locale = 'en-US',
    style = 'long',
    numeric = 'always',
  } = options
  const diffMs =
    getValidDateTime(date, 'date') - getValidDateTime(baseDate, 'baseDate')
  const absoluteDifference = Math.abs(diffMs)
  const rtf = getRelativeTimeFormatter(locale, { style, numeric })

  if (absoluteDifference < MINUTE) {
    return rtf.format(roundSigned(diffMs / SECOND), 'second')
  }
  if (absoluteDifference < HOUR) {
    return rtf.format(roundSigned(diffMs / MINUTE), 'minute')
  }
  if (absoluteDifference < DAY) {
    return rtf.format(roundSigned(diffMs / HOUR), 'hour')
  }
  if (absoluteDifference < WEEK) {
    return rtf.format(roundSigned(diffMs / DAY), 'day')
  }
  if (absoluteDifference < MONTH) {
    return rtf.format(roundSigned(diffMs / WEEK), 'week')
  }
  if (absoluteDifference < YEAR) {
    return rtf.format(roundSigned(diffMs / MONTH), 'month')
  }
  return rtf.format(roundSigned(diffMs / YEAR), 'year')
}

function roundSigned(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value))
}
