import { getValidDateTime } from './dateValidation.js'

type SubDayUnit = 'hour' | 'minute' | 'second'

const UNIT_MILLISECONDS: Record<SubDayUnit, number> = {
  hour: 3_600_000,
  minute: 60_000,
  second: 1_000,
}

export function alignSubDayBoundary(
  candidate: Date,
  inputTimestamp: number,
  inputOffset: number,
  unit: SubDayUnit,
  direction: 'start' | 'end'
): Date {
  const candidateTimestamp = getValidDateTime(candidate, 'result')
  const candidateOffset = getLocalOffsetMilliseconds(candidate)
  const distance = UNIT_MILLISECONDS[unit]

  if (
    candidateOffset === inputOffset &&
    isWithinBoundaryDistance(
      candidateTimestamp,
      inputTimestamp,
      distance,
      direction
    )
  ) {
    return candidate
  }

  let input: Date | undefined
  const adjusted = new Date(
    candidateTimestamp + candidateOffset - inputOffset
  )
  if (
    Number.isFinite(adjusted.getTime()) &&
    getLocalOffsetMilliseconds(adjusted) === inputOffset &&
    isWithinBoundaryDistance(
      adjusted.getTime(),
      inputTimestamp,
      distance,
      direction
    ) &&
    isSameLocalUnit(
      adjusted,
      (input = new Date(inputTimestamp)),
      unit
    )
  ) {
    return adjusted
  }

  return findOffsetOccurrenceBoundary(
    input ?? new Date(inputTimestamp),
    inputOffset,
    unit,
    direction
  )
}

function findOffsetOccurrenceBoundary(
  input: Date,
  inputOffset: number,
  unit: SubDayUnit,
  direction: 'start' | 'end'
): Date {
  const inputTimestamp = input.getTime()
  const distance = UNIT_MILLISECONDS[unit]
  let earlier =
    direction === 'start' ? inputTimestamp - distance : inputTimestamp
  let later =
    direction === 'start' ? inputTimestamp : inputTimestamp + distance
  const probe = new Date(earlier)

  getValidDateTime(probe, 'result')
  probe.setTime(later)
  getValidDateTime(probe, 'result')

  while (later - earlier > 1) {
    const middle = earlier + Math.floor((later - earlier) / 2)
    probe.setTime(middle)
    const matches = isInOffsetOccurrence(
      probe,
      input,
      inputOffset,
      unit
    )

    if (direction === 'start') {
      if (matches) later = middle
      else earlier = middle
    } else if (matches) {
      earlier = middle
    } else {
      later = middle
    }
  }

  probe.setTime(direction === 'start' ? later : earlier)
  return probe
}

function isInOffsetOccurrence(
  candidate: Date,
  input: Date,
  inputOffset: number,
  unit: SubDayUnit
): boolean {
  return (
    getLocalOffsetMilliseconds(candidate) === inputOffset &&
    isSameLocalUnit(candidate, input, unit)
  )
}

function isSameLocalUnit(
  left: Date,
  right: Date,
  unit: SubDayUnit
): boolean {
  if (
    left.getFullYear() !== right.getFullYear() ||
    left.getMonth() !== right.getMonth() ||
    left.getDate() !== right.getDate() ||
    left.getHours() !== right.getHours()
  ) {
    return false
  }

  if (unit === 'hour') return true
  if (left.getMinutes() !== right.getMinutes()) return false
  return unit === 'minute' || left.getSeconds() === right.getSeconds()
}

export function getLocalOffsetMilliseconds(date: Date): number {
  const localDay = getLocalDayNumber(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  )
  const localTime =
    localDay * 86_400_000 +
    date.getHours() * 3_600_000 +
    date.getMinutes() * 60_000 +
    date.getSeconds() * 1_000 +
    date.getMilliseconds()
  return localTime - date.getTime()
}

function getLocalDayNumber(
  yearValue: number,
  month: number,
  day: number
): number {
  let year = yearValue
  if (month <= 2) year -= 1
  const era = Math.floor(year / 400)
  const yearOfEra = year - era * 400
  const marchBasedMonth = month + (month > 2 ? -3 : 9)
  const dayOfYear = Math.floor((153 * marchBasedMonth + 2) / 5) + day - 1
  const dayOfEra =
    yearOfEra * 365 +
    Math.floor(yearOfEra / 4) -
    Math.floor(yearOfEra / 100) +
    dayOfYear
  return era * 146_097 + dayOfEra - 719_468
}

function isWithinBoundaryDistance(
  candidateTimestamp: number,
  inputTimestamp: number,
  distance: number,
  direction: 'start' | 'end'
): boolean {
  const difference =
    direction === 'start'
      ? inputTimestamp - candidateTimestamp
      : candidateTimestamp - inputTimestamp
  return difference >= 0 && difference < distance
}
