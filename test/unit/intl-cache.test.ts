import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearIntlFormatterCaches,
  getDateTimeFormatter,
  getRelativeTimeFormatter,
} from '../../src/utils/intlFormatters.js'

describe('Intl formatter caches', () => {
  afterEach(() => {
    clearIntlFormatterCaches()
    vi.restoreAllMocks()
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

  it('rejects oversized locales before canonicalization', () => {
    const oversizedLocale = `en-x-${'a-'.repeat(126)}a`
    const canonicalize = vi.spyOn(Intl, 'getCanonicalLocales')

    expect(() =>
      getDateTimeFormatter(oversizedLocale, { timeZone: 'UTC' })
    ).toThrow(RangeError)
    expect(() => getRelativeTimeFormatter(oversizedLocale, {})).toThrow(
      RangeError
    )
    expect(canonicalize).not.toHaveBeenCalled()
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
