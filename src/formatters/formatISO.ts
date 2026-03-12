import type { ISOFormatOptions } from '../types.js'

/**
 * Format date as ISO 8601 string
 *
 * @param date - Date to format
 * @param options - ISO options
 * @returns ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ)
 *
 * @example
 * ```ts
 * formatISO(new Date('2025-01-15T15:30:00Z'))
 * // '2025-01-15T15:30:00.000Z'
 *
 * formatISO(new Date(), { representation: 'date' })
 * // '2025-01-15'
 *
 * formatISO(new Date(), { representation: 'time' })
 * // '15:30:00.000Z'
 * ```
 */
export function formatISO(
  date: Date,
  options: ISOFormatOptions = {}
): string {
  const { representation = 'complete' } = options

  const iso = date.toISOString()

  if (representation === 'date') {
    return iso.split('T')[0]!
  }

  if (representation === 'time') {
    return iso.split('T')[1]!
  }

  return iso
}
