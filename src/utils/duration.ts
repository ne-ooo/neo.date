import type { Duration } from '../types.js'

export interface NormalizedDuration {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}

function normalizeField(value: number | undefined, field: string): number {
  if (value === undefined) return 0

  if (!Number.isSafeInteger(value)) {
    throw new RangeError(
      `duration.${field} must be a finite integer within the safe integer range`
    )
  }

  return value
}

function getOwnField(
  duration: Duration,
  field: keyof NormalizedDuration
): number | undefined {
  return Object.hasOwn(duration, field) ? duration[field] : undefined
}

export function normalizeDuration(duration: Duration): NormalizedDuration {
  if (duration === null || typeof duration !== 'object') {
    throw new TypeError('duration must be an object')
  }

  return {
    years: normalizeField(getOwnField(duration, 'years'), 'years'),
    months: normalizeField(getOwnField(duration, 'months'), 'months'),
    days: normalizeField(getOwnField(duration, 'days'), 'days'),
    hours: normalizeField(getOwnField(duration, 'hours'), 'hours'),
    minutes: normalizeField(getOwnField(duration, 'minutes'), 'minutes'),
    seconds: normalizeField(getOwnField(duration, 'seconds'), 'seconds'),
    milliseconds: normalizeField(
      getOwnField(duration, 'milliseconds'),
      'milliseconds'
    ),
  }
}
