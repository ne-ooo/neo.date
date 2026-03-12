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
 * Format options using Intl.DateTimeFormat
 */
export interface FormatOptions {
  /** Locale string (e.g., 'en-US', 'fr-FR') */
  locale?: string
  /** IANA timezone (e.g., 'America/New_York', 'Europe/London') */
  timeZone?: string
  /** Date formatting style */
  dateStyle?: 'full' | 'long' | 'medium' | 'short'
  /** Time formatting style */
  timeStyle?: 'full' | 'long' | 'medium' | 'short'
  /** Year format */
  year?: 'numeric' | '2-digit'
  /** Month format */
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow'
  /** Day format */
  day?: 'numeric' | '2-digit'
  /** Hour format */
  hour?: 'numeric' | '2-digit'
  /** Minute format */
  minute?: 'numeric' | '2-digit'
  /** Second format */
  second?: 'numeric' | '2-digit'
  /** 12-hour clock */
  hour12?: boolean
}

/**
 * Relative time format options
 */
export interface RelativeTimeOptions {
  /** Locale string */
  locale?: string
  /** Formatting style */
  style?: 'long' | 'short' | 'narrow'
}

/**
 * ISO 8601 format options
 */
export interface ISOFormatOptions {
  /** Representation type */
  representation?: 'complete' | 'date' | 'time'
}
