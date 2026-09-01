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

  it('uses compatible disambiguation when local midnight is skipped', () => {
    withTimeZone('Africa/Cairo', () => {
      for (const value of ['2025-04-25', '2025-04-25T00:00']) {
        const result = parseISO(value)

        expect(result.getFullYear()).toBe(2025)
        expect(result.getMonth()).toBe(3)
        expect(result.getDate()).toBe(25)
        expect(result.getHours()).toBe(1)
      }
    })

    withTimeZone('America/Sao_Paulo', () => {
      expect(parseISO('2018-11-04').getHours()).toBe(1)
    })
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

  it('ignores inherited duration fields', () => {
    const base = new Date('2025-01-01T00:00:00.000Z')
    const inherited = Object.create({ days: 365 }) as { days?: number }
    const assigned = Object.assign(
      {},
      JSON.parse('{"__proto__":{"days":365}}') as object
    ) as { days?: number }

    expect(Object.hasOwn(assigned, 'days')).toBe(false)
    expect(add(base, inherited)).toEqual(base)
    expect(add(base, assigned)).toEqual(base)
    expect(subtract(base, assigned)).toEqual(base)
  })

  it('preserves wall time when an intermediate month starts in a DST gap', () => {
    withTimeZone('Africa/Cairo', () => {
      const source = new Date(2014, 7, 15, 0, 30)
      const target = new Date(2014, 8, 15, 0, 30)

      expect(add(source, { months: 1 }).getHours()).toBe(0)
      expect(subtract(source, { months: 1 }).getHours()).toBe(0)
      expect(diff(target, source, 'months')).toBe(1)
    })
  })

  it('combines cancelling sub-day fields without precision loss', () => {
    const duration = {
      hours: 111_822_776_263_579,
      minutes: -6_709_366_575_814_522,
    }

    expect(add(new Date(0), duration).getTime()).toBe(13_080_000)
    expect(subtract(new Date(0), duration).getTime()).toBe(-13_080_000)
  })
})

describe('timezone-aware boundaries', () => {
  it('keeps repeated-hour boundaries around the input instant', () => {
    withTimeZone('America/New_York', () => {
      const date = new Date('2025-11-02T01:30:45.500-05:00')

      expect(startOf(date, 'hour').toISOString()).toBe(
        '2025-11-02T06:00:00.000Z'
      )
      expect(endOf(date, 'hour').toISOString()).toBe(
        '2025-11-02T06:59:59.999Z'
      )
      expect(endOf(date, 'minute').toISOString()).toBe(
        '2025-11-02T06:30:59.999Z'
      )
      expect(endOf(date, 'second').toISOString()).toBe(
        '2025-11-02T06:30:45.999Z'
      )

      for (const unit of ['hour', 'minute', 'second'] as const) {
        expect(startOf(date, unit).getTime()).toBeLessThanOrEqual(date.getTime())
        expect(endOf(date, unit).getTime()).toBeGreaterThanOrEqual(date.getTime())
      }
    })
  })

  it('handles partial-hour offset folds', () => {
    withTimeZone('Australia/Lord_Howe', () => {
      const date = new Date('2025-04-06T01:45:30.500+10:30')

      expect(startOf(date, 'hour').toISOString()).toBe(
        '2025-04-05T15:00:00.000Z'
      )
      expect(endOf(date, 'hour').toISOString()).toBe(
        '2025-04-05T15:29:59.999Z'
      )
      expect(startOf(date, 'minute').toISOString()).toBe(
        '2025-04-05T15:15:00.000Z'
      )
      expect(startOf(date, 'second').toISOString()).toBe(
        '2025-04-05T15:15:30.000Z'
      )

      for (const unit of ['hour', 'minute', 'second'] as const) {
        expect(startOf(date, unit).getTime()).toBeLessThanOrEqual(date.getTime())
        expect(endOf(date, unit).getTime()).toBeGreaterThanOrEqual(date.getTime())
      }
    })
  })

  it('clips boundaries on both sides of a partial-hour offset gap', () => {
    withTimeZone('Pacific/Chatham', () => {
      const before = new Date('2025-09-28T02:30:00+12:45')
      const after = new Date('2025-09-28T03:45:00+13:45')

      expect(endOf(before, 'hour').toISOString()).toBe(
        '2025-09-27T13:59:59.999Z'
      )
      expect(startOf(after, 'hour').toISOString()).toBe(
        '2025-09-27T14:00:00.000Z'
      )
    })
  })

  it('uses the last instant before the next local day', () => {
    withTimeZone('Africa/Cairo', () => {
      const result = endOf(new Date(1999, 8, 30, 12), 'day')

      expect(result.toISOString()).toBe('1999-09-30T21:59:59.999Z')
    })
  })

  it('does not carry the input time through a next-day gap', () => {
    withTimeZone('America/Nuuk', () => {
      const result = endOf(new Date(2026, 2, 27, 23, 30), 'day')

      expect(result.toISOString()).toBe('2026-03-28T01:59:59.999Z')
    })
  })

  it('preserves years from 0 through 99 in calendar ends', () => {
    withTimeZone('UTC', () => {
      const date = new Date(0)
      date.setFullYear(50, 5, 15)
      date.setHours(12, 30)

      expect(endOf(date, 'day').getFullYear()).toBe(50)
      expect(endOf(date, 'month').getFullYear()).toBe(50)
      expect(endOf(date, 'year').getFullYear()).toBe(50)
      expect(endOf(date, 'year').toISOString()).toBe(
        '0050-12-31T23:59:59.999Z'
      )
    })
  })

  it('handles a skipped final calendar date', () => {
    withTimeZone('Pacific/Kiritimati', () => {
      const result = endOf(new Date(1994, 5, 15), 'year')

      expect([
        result.getFullYear(),
        result.getMonth(),
        result.getDate(),
        result.getHours(),
        result.getMinutes(),
        result.getSeconds(),
        result.getMilliseconds(),
      ]).toEqual([1994, 11, 30, 23, 59, 59, 999])
    })
  })
})

describe('runtime discriminants', () => {
  const date = new Date('2025-01-15T15:30:00.000Z')
  const invalidValues: unknown[] = ['__proto__', 'unexpected', null, 1]

  it('rejects invalid boundary units', () => {
    for (const value of invalidValues) {
      expect(() => startOf(date, value as never)).toThrow(RangeError)
      expect(() => endOf(date, value as never)).toThrow(RangeError)
    }
  })

  it('rejects invalid ISO representations', () => {
    for (const value of invalidValues) {
      expect(() =>
        formatISO(date, { representation: value as never })
      ).toThrow(RangeError)
    }
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

  it('handles candidate overshoot at the Date range limits', () => {
    withTimeZone('UTC', () => {
      const maximum = new Date(8_640_000_000_000_000)
      const minimum = new Date(-8_640_000_000_000_000)

      expect(diff(maximum, new Date(maximum.getTime() - 1), 'days')).toBe(0)
      expect(diff(maximum, minimum, 'months')).toBe(6_570_976)
    })

    withTimeZone('America/New_York', () => {
      const maximum = new Date(8_640_000_000_000_000)

      expect(diff(maximum, new Date(0), 'years')).toBe(273_790)
      expect(diff(maximum, new Date(0), 'months')).toBe(3_285_488)
    })
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

function withTimeZone<T>(timeZone: string, callback: () => T): T {
  const originalTimeZone = process.env.TZ

  try {
    process.env.TZ = timeZone
    return callback()
  } finally {
    if (originalTimeZone === undefined) {
      delete process.env.TZ
    } else {
      process.env.TZ = originalTimeZone
    }
  }
}
