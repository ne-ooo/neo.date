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

export function normalizeDuration(duration: Duration): NormalizedDuration {
  if (duration === null || typeof duration !== 'object') {
    throw new TypeError('duration must be an object')
  }

  return {
    years: normalizeField(duration.years, 'years'),
    months: normalizeField(duration.months, 'months'),
    days: normalizeField(duration.days, 'days'),
    hours: normalizeField(duration.hours, 'hours'),
    minutes: normalizeField(duration.minutes, 'minutes'),
    seconds: normalizeField(duration.seconds, 'seconds'),
    milliseconds: normalizeField(duration.milliseconds, 'milliseconds'),
  }
}
