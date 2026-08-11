import { afterEach, describe, expect, it } from 'vitest'
import {
  clearIntlFormatterCaches,
  getDateTimeFormatter,
  getRelativeTimeFormatter,
} from '../../src/utils/intlFormatters.js'

describe('Intl formatter caches', () => {
  afterEach(() => {
    clearIntlFormatterCaches()
  })

  it('reuses equivalent date-time formatters', () => {
    const first = getDateTimeFormatter('en-us', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    })
    const second = getDateTimeFormatter('en-US', {
      timeZone: 'UTC',
      dateStyle: 'medium',
    })

    expect(second).toBe(first)
  })

  it('reuses equivalent relative-time formatters', () => {
    const first = getRelativeTimeFormatter('es', {
      numeric: 'always',
      style: 'long',
    })
    const second = getRelativeTimeFormatter('es', {
      style: 'long',
      numeric: 'always',
    })

    expect(second).toBe(first)
  })

  it('evicts old entries instead of growing without bound', () => {
    const first = getDateTimeFormatter('en-US-x-cache-0', {
      timeZone: 'UTC',
    })

    for (let index = 1; index <= 32; index += 1) {
      getDateTimeFormatter(`en-US-x-cache-${index}`, { timeZone: 'UTC' })
    }

    expect(
      getDateTimeFormatter('en-US-x-cache-0', { timeZone: 'UTC' })
    ).not.toBe(first)
  })

  it('does not retain oversized user-controlled cache keys', () => {
    const locale =
      'en-US-x-' +
      Array.from({ length: 70 }, (_, index) =>
        `cache${index}`.padEnd(8, 'x')
      ).join('-')

    try {
      const first = getDateTimeFormatter(locale, { timeZone: 'UTC' })
      const second = getDateTimeFormatter(locale, { timeZone: 'UTC' })

      expect(second).not.toBe(first)
    } catch (error) {
      // Older ICU versions reject very long private-use locale tags. Rejected
      // keys are never inserted, which is also a safe outcome.
      expect(error).toBeInstanceOf(RangeError)
    }
  })

  it('does not reuse an implicit-zone formatter after TZ changes', () => {
    const originalTimeZone = process.env.TZ

    try {
      process.env.TZ = 'UTC'
      const utcFormatter = getDateTimeFormatter('en-US', {
        dateStyle: 'medium',
      })

      process.env.TZ = 'America/New_York'
      const newYorkFormatter = getDateTimeFormatter('en-US', {
        dateStyle: 'medium',
      })

      expect(newYorkFormatter).not.toBe(utcFormatter)
    } finally {
      if (originalTimeZone === undefined) {
        delete process.env.TZ
      } else {
        process.env.TZ = originalTimeZone
      }
    }
  })
})
