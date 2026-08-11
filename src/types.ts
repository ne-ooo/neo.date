/**
 * Time unit types
 */
export type TimeUnit =
  | 'year'
  | 'month'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond'

/**
 * Time units supported by startOf() and endOf().
 */
export type BoundaryUnit = Exclude<TimeUnit, 'millisecond'>

/**
 * Plural time units accepted by diff().
 */
export type DifferenceUnit = `${TimeUnit}s`

/**
 * Duration object for date manipulation
 */
export interface Duration {
  /** Number of years */
  years?: number
  /** Number of months */
  months?: number
  /** Number of days */
  days?: number
  /** Number of hours */
  hours?: number
  /** Number of minutes */
  minutes?: number
  /** Number of seconds */
  seconds?: number
  /** Number of milliseconds */
  milliseconds?: number
}

/**
 * All native Intl.DateTimeFormat options plus a locale selector.
 */
export interface FormatOptions extends Intl.DateTimeFormatOptions {
  /** Locale string (e.g., 'en-US', 'fr-FR') */
  locale?: string
}

/**
 * Relative time format options
 */
export interface RelativeTimeOptions {
  /** Locale string */
  locale?: string
  /** Formatting style */
  style?: 'long' | 'short' | 'narrow'
  /** Use words such as "tomorrow" (`auto`) or numeric output (`always`) */
  numeric?: 'always' | 'auto'
}

/**
 * ISO 8601 format options
 */
export interface ISOFormatOptions {
  /** Representation type */
  representation?: 'complete' | 'date' | 'time'
}
