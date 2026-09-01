import type { ISOFormatOptions } from '../types.js'
import { getValidDateTime } from '../utils/dateValidation.js'
import { assertOptionsObject } from '../utils/optionsValidation.js'

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
  getValidDateTime(date)
  assertOptionsObject(options)
  const representationValue = Object.hasOwn(options, 'representation')
    ? options.representation
    : undefined
  const representation =
    representationValue === undefined ? 'complete' : representationValue

  if (
    representation !== 'complete' &&
    representation !== 'date' &&
    representation !== 'time'
  ) {
    throw new RangeError('Invalid ISO representation')
  }

  const iso = Date.prototype.toISOString.call(date)
  const separatorIndex = iso.indexOf('T')

  if (representation === 'date') {
    return iso.slice(0, separatorIndex)
  }

  if (representation === 'time') {
    return iso.slice(separatorIndex + 1)
  }

  return iso
}
