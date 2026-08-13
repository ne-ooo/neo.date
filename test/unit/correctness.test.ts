import { describe, expect, it } from 'vitest'
import {
  add,
  compare,
  diff,
  endOf,
  format,
  formatISO,
  formatRelative,
  isEqual,
  parseISO,
  startOf,
  subtract,
} from '../../src/index.js'

describe('strict ISO parsing', () => {
  it('rejects non-ISO input accepted by the native Date parser', () => {
    expect(() => parseISO('January 15, 2025')).toThrow('Invalid ISO date string')
  })

  it('rejects impossible calendar dates', () => {
    expect(() => parseISO('2025-02-29')).toThrow('Invalid ISO date string')
  })

  it('parses a date-only value at local midnight', () => {
    const result = parseISO('2025-01-15')

    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(0)
    expect(result.getDate()).toBe(15)
    expect(result.getHours()).toBe(0)
  })
})

describe('validated comparisons', () => {
  it('rejects an invalid date instead of comparing it as equal', () => {
    const invalid = new Date(NaN)
    const valid = new Date(0)

    expect(() => compare(invalid, valid)).toThrow('valid Date')
    expect(() => isEqual(invalid, valid)).toThrow('valid Date')
  })

  it('consistently rejects invalid dates across the public API', () => {
    const invalid = new Date(NaN)
    const valid = new Date(0)
    const operations = [
      () => format(invalid),
      () => formatISO(invalid),
      () => formatRelative(invalid, valid),
      () => add(invalid, { days: 1 }),
      () => subtract(invalid, { days: 1 }),
      () => startOf(invalid, 'day'),
      () => endOf(invalid, 'day'),
      () => diff(invalid, valid, 'days'),
    ]

    for (const operation of operations) {
      expect(operation).toThrow('valid Date')
    }
  })
})

describe('calendar-aware manipulation', () => {
  it('clamps month additions to the last valid day', () => {
    const result = add(new Date(2025, 0, 31, 12), { months: 1 })

    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(1)
    expect(result.getDate()).toBe(28)
    expect(result.getHours()).toBe(12)
  })

  it('clamps leap-day year additions', () => {
    const result = add(new Date(2024, 1, 29, 12), { years: 1 })

    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(1)
    expect(result.getDate()).toBe(28)
  })

  it('keeps sub-day units as elapsed durations across DST', () => {
    const date = new Date('2025-11-02T00:30:00-04:00')
    const result = add(date, { hours: 2 })

    expect(result.getTime() - date.getTime()).toBe(2 * 60 * 60 * 1000)
  })

  it('rejects non-finite durations', () => {
    expect(() => add(new Date(), { days: Infinity })).toThrow('finite integer')
    expect(() => subtract(new Date(), { minutes: NaN })).toThrow('finite integer')
  })
})

describe('signed complete-unit differences', () => {
  it('truncates fractional elapsed units symmetrically', () => {
    const earlier = new Date(0)
    const later = new Date(999)

    expect(diff(later, earlier, 'seconds')).toBe(0)
    expect(diff(earlier, later, 'seconds')).toBe(0)
  })

  it('counts only complete calendar years', () => {
    const earlier = new Date(2024, 11, 31)
    const later = new Date(2025, 0, 1)

    expect(diff(later, earlier, 'years')).toBe(0)
    expect(diff(earlier, later, 'years')).toBe(0)
  })

  it('counts local calendar days across a DST transition', () => {
    const earlier = new Date(2025, 2, 9, 0, 30)
    const later = new Date(2025, 2, 10, 0, 30)

    expect(diff(later, earlier, 'days')).toBe(1)
    expect(diff(earlier, later, 'days')).toBe(-1)
  })

  it('counts civil days across leap and negative-year boundaries', () => {
    const yearZero = new Date(0)
    yearZero.setFullYear(0, 1, 28)
    yearZero.setHours(12, 0, 0, 0)
    const leapDay = new Date(yearZero)
    leapDay.setDate(leapDay.getDate() + 1)

    const negativeYear = new Date(0)
    negativeYear.setFullYear(-1, 11, 31)
    negativeYear.setHours(12, 0, 0, 0)
    const nextDay = new Date(negativeYear)
    nextDay.setDate(nextDay.getDate() + 1)

    expect(diff(leapDay, yearZero, 'days')).toBe(1)
    expect(diff(nextDay, negativeYear, 'days')).toBe(1)
  })

  it('is antisymmetric for every unit, including month-end dates', () => {
    const left = new Date(2024, 1, 29, 12, 30)
    const right = new Date(2025, 2, 31, 10, 15)
    const units = [
      'years',
      'months',
      'days',
      'hours',
      'minutes',
      'seconds',
      'milliseconds',
    ] as const

    for (const unit of units) {
      expect(diff(left, right, unit)).toBe(-diff(right, left, unit))
    }
  })
})

describe('relative time thresholds', () => {
  const base = new Date('2025-01-01T00:00:00.000Z')

  it('uses numeric output by default', () => {
    expect(formatRelative(new Date(base.getTime() + 86_400_000), base)).toBe(
      'in 1 day'
    )
  })

  it('keeps multi-week differences in weeks', () => {
    expect(
      formatRelative(new Date(base.getTime() + 20 * 86_400_000), base)
    ).toBe('in 3 weeks')
  })

  it('keeps sub-year differences in months', () => {
    expect(
      formatRelative(new Date(base.getTime() + 200 * 86_400_000), base)
    ).toBe('in 7 months')
  })
})
