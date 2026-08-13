import { add } from '../manipulators/add.js'
import type { DifferenceUnit } from '../types.js'
import { getValidDateTime } from './dateValidation.js'

/**
 * Calculate the signed number of complete units between dates.
 * Calendar units use local civil time; sub-day units use elapsed time.
 *
 * @param dateLeft - Later date
 * @param dateRight - Earlier date
 * @param unit - Unit to return difference in
 * @returns Difference in specified unit
 *
 * @example
 * ```ts
 * const date1 = new Date('2025-01-15')
 * const date2 = new Date('2025-01-20')
 *
 * diff(date2, date1, 'days')
 * // 5
 *
 * diff(date2, date1, 'hours')
 * // 120
 *
 * diff(date1, date2, 'days')
 * // -5 (negative because date1 is earlier)
 * ```
 */
export function diff(
  dateLeft: Date,
  dateRight: Date,
  unit: DifferenceUnit
): number {
  const leftTime = getValidDateTime(dateLeft, 'dateLeft')
  const rightTime = getValidDateTime(dateRight, 'dateRight')
  const diffMs = leftTime - rightTime

  switch (unit) {
    case 'years':
      return differenceInCompleteCalendarUnits(
        new Date(leftTime),
        new Date(rightTime),
        'years'
      )
    case 'months':
      return differenceInCompleteCalendarUnits(
        new Date(leftTime),
        new Date(rightTime),
        'months'
      )
    case 'days':
      return differenceInCompleteCalendarUnits(
        new Date(leftTime),
        new Date(rightTime),
        'days'
      )
    case 'hours':
      return truncateDifference(diffMs / 3_600_000)
    case 'minutes':
      return truncateDifference(diffMs / 60_000)
    case 'seconds':
      return truncateDifference(diffMs / 1_000)
    case 'milliseconds':
      return diffMs
    default:
      throw new Error(`Invalid unit: ${unit}`)
  }
}

function differenceInCompleteCalendarUnits(
  dateLeft: Date,
  dateRight: Date,
  unit: 'years' | 'months' | 'days'
): number {
  const leftTime = dateLeft.getTime()
  const rightTime = dateRight.getTime()

  if (leftTime === rightTime) return 0

  const sign = leftTime > rightTime ? 1 : -1
  const later = sign === 1 ? dateLeft : dateRight
  const earlier = sign === 1 ? dateRight : dateLeft
  let estimate = estimateCalendarUnits(later, earlier, unit)
  const candidate = addCalendarUnits(earlier, unit, estimate)

  if (candidate.getTime() > later.getTime()) {
    estimate -= 1
  }

  return estimate === 0 ? 0 : sign * estimate
}

function estimateCalendarUnits(
  later: Date,
  earlier: Date,
  unit: 'years' | 'months' | 'days'
): number {
  if (unit === 'years') {
    return later.getFullYear() - earlier.getFullYear()
  }

  if (unit === 'months') {
    return (
      (later.getFullYear() - earlier.getFullYear()) * 12 +
      later.getMonth() -
      earlier.getMonth()
    )
  }

  return localDayNumber(later) - localDayNumber(earlier)
}

function addCalendarUnits(
  date: Date,
  unit: 'years' | 'months' | 'days',
  amount: number
): Date {
  if (unit === 'years') return add(date, { years: amount })
  if (unit === 'months') return add(date, { months: amount })
  return add(date, { days: amount })
}

function localDayNumber(date: Date): number {
  let year = date.getFullYear()
  const month = date.getMonth() + 1

  // Map the local civil date to a proleptic-Gregorian day number without
  // allocating another Date. March is month zero so leap days end each year.
  if (month <= 2) year -= 1
  const era = Math.floor(year / 400)
  const yearOfEra = year - era * 400
  const marchBasedMonth = month + (month > 2 ? -3 : 9)
  const dayOfYear =
    Math.floor((153 * marchBasedMonth + 2) / 5) + date.getDate() - 1
  const dayOfEra =
    yearOfEra * 365 +
    Math.floor(yearOfEra / 4) -
    Math.floor(yearOfEra / 100) +
    dayOfYear

  // 719468 maps the algorithm's 0000-03-01 origin to 1970-01-01.
  return era * 146_097 + dayOfEra - 719_468
}

function truncateDifference(value: number): number {
  const truncated = Math.trunc(value)
  return Object.is(truncated, -0) ? 0 : truncated
}
