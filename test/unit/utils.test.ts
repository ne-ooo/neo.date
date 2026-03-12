import { describe, it, expect } from 'vitest'
import {
  isValid,
  diff,
  compare,
  isEqual,
  isBefore,
  isAfter,
} from '../../src/index.js'

describe('isValid', () => {
  describe('valid dates', () => {
    it('should return true for valid date', () => {
      const date = new Date('2025-01-15')

      expect(isValid(date)).toBe(true)
    })

    it('should return true for current date', () => {
      const date = new Date()

      expect(isValid(date)).toBe(true)
    })

    it('should return true for date with time', () => {
      const date = new Date('2025-01-15T15:30:00.000Z')

      expect(isValid(date)).toBe(true)
    })
  })

  describe('invalid dates', () => {
    it('should return false for invalid date string', () => {
      const date = new Date('invalid')

      expect(isValid(date)).toBe(false)
    })

    it('should return false for NaN date', () => {
      const date = new Date(NaN)

      expect(isValid(date)).toBe(false)
    })
  })
})

describe('diff', () => {
  describe('milliseconds', () => {
    it('should calculate difference in milliseconds', () => {
      const date1 = new Date('2025-01-15T00:00:00.000Z')
      const date2 = new Date('2025-01-15T00:00:01.000Z')

      const result = diff(date2, date1, 'milliseconds')

      expect(result).toBe(1000)
    })

    it('should return negative for reversed dates', () => {
      const date1 = new Date('2025-01-15T00:00:00.000Z')
      const date2 = new Date('2025-01-15T00:00:01.000Z')

      const result = diff(date1, date2, 'milliseconds')

      expect(result).toBe(-1000)
    })
  })

  describe('seconds', () => {
    it('should calculate difference in seconds', () => {
      const date1 = new Date('2025-01-15T00:00:00.000Z')
      const date2 = new Date('2025-01-15T00:01:00.000Z')

      const result = diff(date2, date1, 'seconds')

      expect(result).toBe(60)
    })
  })

  describe('minutes', () => {
    it('should calculate difference in minutes', () => {
      const date1 = new Date('2025-01-15T00:00:00.000Z')
      const date2 = new Date('2025-01-15T01:00:00.000Z')

      const result = diff(date2, date1, 'minutes')

      expect(result).toBe(60)
    })
  })

  describe('hours', () => {
    it('should calculate difference in hours', () => {
      const date1 = new Date('2025-01-15T00:00:00.000Z')
      const date2 = new Date('2025-01-15T05:00:00.000Z')

      const result = diff(date2, date1, 'hours')

      expect(result).toBe(5)
    })
  })

  describe('days', () => {
    it('should calculate difference in days', () => {
      const date1 = new Date('2025-01-15T00:00:00.000Z')
      const date2 = new Date('2025-01-20T00:00:00.000Z')

      const result = diff(date2, date1, 'days')

      expect(result).toBe(5)
    })

    it('should handle large day differences', () => {
      const date1 = new Date('2025-01-01T00:00:00.000Z')
      const date2 = new Date('2025-12-31T00:00:00.000Z')

      const result = diff(date2, date1, 'days')

      expect(result).toBe(364)
    })
  })

  describe('months', () => {
    it('should calculate difference in months', () => {
      const date1 = new Date('2025-01-15T00:00:00.000Z')
      const date2 = new Date('2025-06-15T00:00:00.000Z')

      const result = diff(date2, date1, 'months')

      expect(result).toBe(5)
    })

    it('should handle year boundaries', () => {
      const date1 = new Date('2024-12-15T00:00:00.000Z')
      const date2 = new Date('2025-03-15T00:00:00.000Z')

      const result = diff(date2, date1, 'months')

      expect(result).toBe(3)
    })
  })

  describe('years', () => {
    it('should calculate difference in years', () => {
      const date1 = new Date('2020-01-15T00:00:00.000Z')
      const date2 = new Date('2025-01-15T00:00:00.000Z')

      const result = diff(date2, date1, 'years')

      expect(result).toBe(5)
    })
  })
})

describe('compare', () => {
  describe('comparing dates', () => {
    it('should return -1 when first date is earlier', () => {
      const date1 = new Date('2025-01-15')
      const date2 = new Date('2025-01-20')

      const result = compare(date1, date2)

      expect(result).toBe(-1)
    })

    it('should return 1 when first date is later', () => {
      const date1 = new Date('2025-01-20')
      const date2 = new Date('2025-01-15')

      const result = compare(date1, date2)

      expect(result).toBe(1)
    })

    it('should return 0 when dates are equal', () => {
      const date1 = new Date('2025-01-15T15:30:00.000Z')
      const date2 = new Date('2025-01-15T15:30:00.000Z')

      const result = compare(date1, date2)

      expect(result).toBe(0)
    })
  })
})

describe('isEqual', () => {
  it('should return true for equal dates', () => {
    const date1 = new Date('2025-01-15T15:30:00.000Z')
    const date2 = new Date('2025-01-15T15:30:00.000Z')

    expect(isEqual(date1, date2)).toBe(true)
  })

  it('should return false for different dates', () => {
    const date1 = new Date('2025-01-15')
    const date2 = new Date('2025-01-20')

    expect(isEqual(date1, date2)).toBe(false)
  })

  it('should return false for dates differing by milliseconds', () => {
    const date1 = new Date('2025-01-15T15:30:00.000Z')
    const date2 = new Date('2025-01-15T15:30:00.001Z')

    expect(isEqual(date1, date2)).toBe(false)
  })
})

describe('isBefore', () => {
  it('should return true when date is before comparison', () => {
    const date = new Date('2025-01-15')
    const comparison = new Date('2025-01-20')

    expect(isBefore(date, comparison)).toBe(true)
  })

  it('should return false when date is after comparison', () => {
    const date = new Date('2025-01-20')
    const comparison = new Date('2025-01-15')

    expect(isBefore(date, comparison)).toBe(false)
  })

  it('should return false when dates are equal', () => {
    const date = new Date('2025-01-15T15:30:00.000Z')
    const comparison = new Date('2025-01-15T15:30:00.000Z')

    expect(isBefore(date, comparison)).toBe(false)
  })
})

describe('isAfter', () => {
  it('should return true when date is after comparison', () => {
    const date = new Date('2025-01-20')
    const comparison = new Date('2025-01-15')

    expect(isAfter(date, comparison)).toBe(true)
  })

  it('should return false when date is before comparison', () => {
    const date = new Date('2025-01-15')
    const comparison = new Date('2025-01-20')

    expect(isAfter(date, comparison)).toBe(false)
  })

  it('should return false when dates are equal', () => {
    const date = new Date('2025-01-15T15:30:00.000Z')
    const comparison = new Date('2025-01-15T15:30:00.000Z')

    expect(isAfter(date, comparison)).toBe(false)
  })
})
