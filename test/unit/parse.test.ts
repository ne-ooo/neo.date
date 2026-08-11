import { describe, it, expect } from 'vitest'
import { parseISO } from '../../src/index.js'

describe('parseISO', () => {
  describe('complete ISO 8601 strings', () => {
    it('should parse complete ISO 8601 string', () => {
      const result = parseISO('2025-01-15T15:30:00.000Z')

      expect(result).toBeInstanceOf(Date)
      expect(result.toISOString()).toBe('2025-01-15T15:30:00.000Z')
    })

    it('should parse ISO string with milliseconds', () => {
      const result = parseISO('2025-01-15T15:30:00.123Z')

      expect(result).toBeInstanceOf(Date)
      expect(result.toISOString()).toBe('2025-01-15T15:30:00.123Z')
    })
  })

  describe('date only strings', () => {
    it('should parse date-only ISO string', () => {
      const result = parseISO('2025-01-15')

      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(0) // January is 0
      expect(result.getDate()).toBe(15)
    })
  })

  describe('timezone offsets', () => {
    it('should parse ISO string with timezone offset', () => {
      const result = parseISO('2025-01-15T15:30:00-05:00')

      expect(result.toISOString()).toBe('2025-01-15T20:30:00.000Z')
    })

    it('should parse ISO string with positive timezone offset', () => {
      const result = parseISO('2025-01-15T15:30:00+02:00')

      expect(result.toISOString()).toBe('2025-01-15T13:30:00.000Z')
    })
  })

  describe('error handling', () => {
    it('should throw error for invalid ISO string', () => {
      expect(() => parseISO('invalid')).toThrow('Invalid ISO date string')
    })

    it('should throw error for malformed date', () => {
      expect(() => parseISO('2025-13-45')).toThrow('Invalid ISO date string')
    })

    it('should throw error for empty string', () => {
      expect(() => parseISO('')).toThrow('Invalid ISO date string')
    })

    it('should reject invalid time and timezone components', () => {
      expect(() => parseISO('2025-01-15T24:00:00Z')).toThrow()
      expect(() => parseISO('2025-01-15T12:60:00Z')).toThrow()
      expect(() => parseISO('2025-01-15T12:00:60Z')).toThrow()
      expect(() => parseISO('2025-01-15T12:00:00+24:00')).toThrow()
    })

    it('should reject oversized input without reflecting it in the error', () => {
      const input = '2'.repeat(1_000_000)

      expect(() => parseISO(input)).toThrowError(
        new RangeError('Invalid ISO date string')
      )
    })
  })
})
