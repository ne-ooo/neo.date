import { describe, it, expect } from 'vitest'
import { formatRelative, parseISO, diff, add, startOf, endOf } from '../../src/index.js'

// ─── formatRelative edge cases ─────────────────────────────────────────────

describe('formatRelative — extended ranges', () => {
  it('formats weeks in the past', () => {
    const base = new Date('2025-01-15T12:00:00.000Z')
    const past = new Date('2025-01-01T12:00:00.000Z') // 14 days = 2 weeks
    const result = formatRelative(past, base)
    expect(result).toContain('week')
  })

  it('formats weeks in the future', () => {
    const base = new Date('2025-01-01T12:00:00.000Z')
    const future = new Date('2025-01-15T12:00:00.000Z') // 14 days = 2 weeks
    const result = formatRelative(future, base)
    expect(result).toContain('week')
  })

  it('formats months in the past', () => {
    const base = new Date('2025-06-15T12:00:00.000Z')
    const past = new Date('2025-01-15T12:00:00.000Z') // ~5 months
    const result = formatRelative(past, base)
    expect(result).toContain('month')
  })

  it('formats months in the future', () => {
    const base = new Date('2025-01-15T12:00:00.000Z')
    const future = new Date('2025-06-15T12:00:00.000Z')
    const result = formatRelative(future, base)
    expect(result).toContain('month')
  })

  it('formats years in the past', () => {
    const base = new Date('2025-01-15T12:00:00.000Z')
    const past = new Date('2022-01-15T12:00:00.000Z') // 3 years
    const result = formatRelative(past, base)
    expect(result).toContain('year')
  })

  it('formats years in the future', () => {
    const base = new Date('2022-01-15T12:00:00.000Z')
    const future = new Date('2025-01-15T12:00:00.000Z')
    const result = formatRelative(future, base)
    expect(result).toContain('year')
  })

  it('formats "now" when difference is near zero', () => {
    const now = new Date('2025-01-15T12:00:00.000Z')
    const sameInstant = new Date('2025-01-15T12:00:00.000Z')
    const result = formatRelative(sameInstant, now)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('uses current time as default baseDate', () => {
    const recent = new Date(Date.now() - 5000) // 5 seconds ago
    const result = formatRelative(recent)
    expect(result).toContain('second')
  })
})

// ─── parseISO edge cases ────────────────────────────────────────────────────

describe('parseISO — edge cases', () => {
  it('parses Feb 29 on a leap year (2024)', () => {
    const result = parseISO('2024-02-29')
    expect(result).toBeInstanceOf(Date)
    expect(result.getMonth()).toBe(1)
    expect(result.getDate()).toBe(29)
  })

  it('throws for Feb 29 on a non-leap year (2025)', () => {
    expect(() => parseISO('2025-02-29')).toThrow('Invalid ISO date string')
  })

  it('parses Unix epoch (1970-01-01T00:00:00.000Z)', () => {
    const result = parseISO('1970-01-01T00:00:00.000Z')
    expect(result.getTime()).toBe(0)
  })

  it('parses Y2K date', () => {
    const result = parseISO('2000-01-01T00:00:00.000Z')
    expect(result.getUTCFullYear()).toBe(2000)
    expect(result.getUTCMonth()).toBe(0)
    expect(result.getUTCDate()).toBe(1)
  })

  it('parses a date at the end of year (Dec 31)', () => {
    const result = parseISO('2024-12-31T23:59:59.999Z')
    expect(result.getUTCFullYear()).toBe(2024)
    expect(result.getUTCMonth()).toBe(11)
    expect(result.getUTCDate()).toBe(31)
    expect(result.getUTCHours()).toBe(23)
    expect(result.getUTCMinutes()).toBe(59)
  })

  it('parses ISO string with milliseconds precision', () => {
    const result = parseISO('2025-03-15T08:00:00.001Z')
    expect(result.getUTCMilliseconds()).toBe(1)
  })

  it('throws for completely non-numeric string', () => {
    expect(() => parseISO('not-a-date')).toThrow('Invalid ISO date string')
  })

  it('throws for partial date (month only)', () => {
    // '2025-13' is invalid month — JS may parse it as NaN
    expect(() => parseISO('2025-13')).toThrow()
  })
})

// ─── diff edge cases ────────────────────────────────────────────────────────

describe('diff — edge cases', () => {
  it('returns 0 for identical dates (all units)', () => {
    const date = new Date('2025-06-15T12:00:00.000Z')
    expect(diff(date, date, 'milliseconds')).toBe(0)
    expect(diff(date, date, 'seconds')).toBe(0)
    expect(diff(date, date, 'minutes')).toBe(0)
    expect(diff(date, date, 'hours')).toBe(0)
    expect(diff(date, date, 'days')).toBe(0)
    expect(diff(date, date, 'months')).toBe(0)
    expect(diff(date, date, 'years')).toBe(0)
  })

  it('truncates incomplete local calendar days', () => {
    const d1 = new Date(2025, 0, 1, 0, 0, 0)
    const d2 = new Date(2025, 0, 1, 23, 59, 59)
    expect(diff(d2, d1, 'days')).toBe(0)
  })

  it('does not count an incomplete calendar year', () => {
    const d1 = new Date(2024, 11, 31)
    const d2 = new Date(2025, 0, 1)
    expect(diff(d2, d1, 'years')).toBe(0)
  })

  it('counts months across year boundary', () => {
    const d1 = new Date(2024, 10, 15)
    const d2 = new Date(2025, 1, 15)
    expect(diff(d2, d1, 'months')).toBe(3)
  })

  it('returns negative for years when earlier date is first arg', () => {
    const d1 = new Date(2020, 0, 1)
    const d2 = new Date(2025, 0, 1)
    expect(diff(d1, d2, 'years')).toBe(-5)
  })
})

// ─── add — leap year edge cases ─────────────────────────────────────────────

describe('add — leap year edge cases', () => {
  it('adding 1 month to Jan 31 clamps to Feb 28 in non-leap year', () => {
    const date = new Date(2025, 0, 31)
    const result = add(date, { months: 1 })
    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(1)
    expect(result.getDate()).toBe(28)
  })

  it('adding 1 year to Feb 29 clamps to Feb 28', () => {
    const leapDay = new Date(2024, 1, 29)
    const result = add(leapDay, { years: 1 })
    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(1)
    expect(result.getDate()).toBe(28)
  })

  it('adding days across Feb in leap year', () => {
    const date = new Date(2024, 1, 28)
    const result = add(date, { days: 1 })
    expect(result.getMonth()).toBe(1)
    expect(result.getDate()).toBe(29)
  })

  it('adding days across Feb in non-leap year', () => {
    const date = new Date(2025, 1, 28)
    const result = add(date, { days: 1 })
    expect(result.getMonth()).toBe(2)
    expect(result.getDate()).toBe(1)
  })
})

// ─── startOf / endOf — boundary correctness ─────────────────────────────────

describe('startOf — boundary correctness', () => {
  it('startOf year gives Jan 1 midnight', () => {
    const date = new Date(2025, 5, 15, 12, 30, 45)
    const result = startOf(date, 'year')
    expect(result.getMonth()).toBe(0)
    expect(result.getDate()).toBe(1)
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })

  it('startOf month gives 1st of month midnight', () => {
    const date = new Date(2025, 2, 20, 15)
    const result = startOf(date, 'month')
    expect(result.getDate()).toBe(1)
    expect(result.getHours()).toBe(0)
  })

  it('startOf day gives midnight', () => {
    const date = new Date(2025, 2, 20, 15, 30, 45, 123)
    const result = startOf(date, 'day')
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })
})

describe('endOf — boundary correctness', () => {
  it('endOf year gives Dec 31 23:59:59.999', () => {
    const date = new Date(2025, 5, 15, 12, 30, 45)
    const result = endOf(date, 'year')
    expect(result.getMonth()).toBe(11)
    expect(result.getDate()).toBe(31)
    expect(result.getHours()).toBe(23)
    expect(result.getMinutes()).toBe(59)
    expect(result.getSeconds()).toBe(59)
    expect(result.getMilliseconds()).toBe(999)
  })

  it('endOf February in leap year gives Feb 29', () => {
    const date = new Date(2024, 1, 10)
    const result = endOf(date, 'month')
    expect(result.getMonth()).toBe(1)
    expect(result.getDate()).toBe(29)
  })

  it('endOf February in non-leap year gives Feb 28', () => {
    const date = new Date(2025, 1, 10)
    const result = endOf(date, 'month')
    expect(result.getMonth()).toBe(1)
    expect(result.getDate()).toBe(28)
  })
})
