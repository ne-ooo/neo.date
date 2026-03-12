/**
 * Parse ISO 8601 date string
 *
 * Supports ISO 8601 and RFC 3339 formats
 *
 * @param dateString - ISO 8601 or RFC 3339 string
 * @returns Date object
 * @throws Error if invalid ISO string
 *
 * @example
 * ```ts
 * parseISO('2025-01-15T15:30:00.000Z')
 * // Date object
 *
 * parseISO('2025-01-15')
 * // Date object (midnight UTC)
 *
 * parseISO('2025-01-15T15:30:00-05:00')
 * // Date object (RFC 3339 with timezone)
 * ```
 */
export function parseISO(dateString: string): Date {
  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date string: ${dateString}`)
  }

  return date
}
