import { describe, it, expect } from 'vitest'
import { format, formatISO, formatRelative } from '../../src/index.js'

describe('format', () => {
  describe('basic formatting', () => {
    it('should format with dateStyle', () => {
      const date = new Date('2025-01-15T15:30:00.000Z')

      const result = format(date, { dateStyle: 'medium' })

      // Result varies by locale, just check it's a string
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should format with timeStyle', () => {
      const date = new Date('2025-01-15T15:30:00.000Z')

      const result = format(date, { timeStyle: 'short' })

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should format with both date and time styles', () => {
      const date = new Date('2025-01-15T15:30:00.000Z')

      const result = format(date, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('custom formatting', () => {
    it('should format with custom year/month/day', () => {
      const date = new Date('2025-01-15T15:30:00.000Z')

      const result = format(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      expect(result).toContain('2025')
      expect(result).toContain('January')
      expect(result).toContain('15')
    })

    it('should format with 2-digit year', () => {
      const date = new Date('2025-01-15T15:30:00.000Z')

      const result = format(date, {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      })

      expect(result).toContain('25')
    })
  })

  describe('timezone support', () => {
    it('should format with timezone', () => {
      const date = new Date('2025-01-15T15:30:00.000Z')

      const result = format(date, {
        timeStyle: 'short',
        timeZone: 'America/New_York',
      })

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('locale support', () => {
    it('should format with different locale', () => {
      const date = new Date('2025-01-15T15:30:00.000Z')

      const result = format(date, {
        locale: 'fr-FR',
        dateStyle: 'long',
      })

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })
})

describe('formatISO', () => {
  describe('complete format', () => {
    it('should format as complete ISO 8601 string', () => {
      const date = new Date('2025-01-15T15:30:00.000Z')

      const result = formatISO(date)

      expect(result).toBe('2025-01-15T15:30:00.000Z')
    })

    it('should format with complete option', () => {
      const date = new Date('2025-01-15T15:30:00.123Z')

      const result = formatISO(date, { representation: 'complete' })

      expect(result).toBe('2025-01-15T15:30:00.123Z')
    })
  })

  describe('date only', () => {
    it('should format date only', () => {
      const date = new Date('2025-01-15T15:30:00.000Z')

      const result = formatISO(date, { representation: 'date' })

      expect(result).toBe('2025-01-15')
    })
  })

  describe('time only', () => {
    it('should format time only', () => {
      const date = new Date('2025-01-15T15:30:00.000Z')

      const result = formatISO(date, { representation: 'time' })

      expect(result).toBe('15:30:00.000Z')
    })
  })
})

describe('formatRelative', () => {
  describe('past times', () => {
    it('should format seconds ago', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 30 * 1000) // 30 seconds ago

      const result = formatRelative(past, now)

      expect(result).toContain('second')
    })

    it('should format minutes ago', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 5 * 60 * 1000) // 5 minutes ago

      const result = formatRelative(past, now)

      expect(result).toContain('minute')
    })

    it('should format hours ago', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago

      const result = formatRelative(past, now)

      expect(result).toContain('hour')
    })

    it('should format days ago', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago

      const result = formatRelative(past, now)

      expect(result).toContain('day')
    })
  })

  describe('future times', () => {
    it('should format future days', () => {
      const now = new Date()
      const future = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) // in 2 days

      const result = formatRelative(future, now)

      expect(result).toContain('day')
    })

    it('should format future hours', () => {
      const now = new Date()
      const future = new Date(now.getTime() + 2 * 60 * 60 * 1000) // in 2 hours

      const result = formatRelative(future, now)

      expect(result).toContain('hour')
    })
  })

  describe('locale support', () => {
    it('should format with different locale', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago

      const result = formatRelative(past, now, { locale: 'es' })

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('style options', () => {
    it('should format with short style', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago

      const result = formatRelative(past, now, { style: 'short' })

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should format with narrow style', () => {
      const now = new Date()
      const past = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago

      const result = formatRelative(past, now, { style: 'narrow' })

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })
})
