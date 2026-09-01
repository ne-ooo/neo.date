import { daysInMonth } from '../utils/calendar.js'

/**
 * Parse ISO 8601 date string
 *
 * Supports strict extended calendar dates and ISO 8601 / RFC 3339 date-times.
 * Date-only and zone-less values use local civil time.
 *
 * @param dateString - ISO 8601 or RFC 3339 string
 * @returns Date object
 * @throws RangeError if the string or calendar value is invalid
 *
 * @example
 * ```ts
 * parseISO('2025-01-15T15:30:00.000Z')
 * // Date object
 *
 * parseISO('2025-01-15')
 * // Date object (midnight in local time)
 *
 * parseISO('2025-01-15T15:30:00-05:00')
 * // Date object (RFC 3339 with timezone)
 * ```
 */
export function parseISO(dateString: string): Date {
  if (typeof dateString !== 'string' || dateString.length > 40) {
    throw new RangeError('Invalid ISO date string')
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-]\d{2}:\d{2})?)?$/.exec(
    dateString
  )

  if (!match) {
    throw new RangeError('Invalid ISO date string')
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4] ?? 0)
  const minute = Number(match[5] ?? 0)
  const second = Number(match[6] ?? 0)
  const millisecond = Number((match[7] ?? '').padEnd(3, '0').slice(0, 3))
  const zone = match[8]

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month - 1) ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    throw new RangeError('Invalid ISO date string')
  }

  if (match[4] === undefined) {
    return createLocalDate(year, month - 1, day, 0, 0, 0, 0)
  }

  if (zone === undefined) {
    return createLocalDate(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      millisecond
    )
  }

  let offsetMinutes = 0
  if (zone !== 'Z') {
    const offsetHour = Number(zone.slice(1, 3))
    const offsetMinute = Number(zone.slice(4, 6))
    if (offsetHour > 23 || offsetMinute > 59) {
      throw new RangeError('Invalid ISO date string')
    }
    offsetMinutes = (offsetHour * 60 + offsetMinute) * (zone[0] === '-' ? -1 : 1)
  }

  const utc = new Date(0)
  utc.setUTCFullYear(year, month - 1, day)
  utc.setUTCHours(hour, minute, second, millisecond)
  const result = new Date(utc.getTime() - offsetMinutes * 60_000)

  if (!Number.isFinite(result.getTime())) {
    throw new RangeError('Invalid ISO date string')
  }

  return result
}

function createLocalDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number
): Date {
  const result = new Date(0)
  result.setFullYear(year, month, day)
  result.setHours(hour, minute, second, millisecond)

  // Match the platform's compatible disambiguation for local times in a
  // daylight-saving gap: advance by the gap instead of rejecting valid ISO
  // calendar components that have no exact local instant.
  if (!Number.isFinite(result.getTime())) {
    throw new RangeError('Invalid ISO date string')
  }

  return result
}
