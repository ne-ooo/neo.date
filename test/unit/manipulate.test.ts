import { describe, it, expect } from 'vitest'
import { add, subtract, startOf, endOf } from '../../src/index.js'

describe('add', () => {
  describe('adding days', () => {
    it('should add days to date', () => {
      const date = new Date('2025-01-15T00:00:00.000Z')
      const result = add(date, { days: 7 })

      expect(result.toISOString()).toBe('2025-01-22T00:00:00.000Z')
    })

    it('should add multiple days', () => {
      const date = new Date('2025-01-15T00:00:00.000Z')
      const result = add(date, { days: 30 })

      expect(result.getDate()).toBe(14) // 15 + 30 days = Feb 14
      expect(result.getMonth()).toBe(1) // February
    })
  })

  describe('adding months', () => {
    it('should add months to date', () => {
      const date = new Date('2025-01-15T00:00:00.000Z')
      const result = add(date, { months: 1 })

      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(15)
    })

    it('should add multiple months', () => {
      const date = new Date('2025-01-15T00:00:00.000Z')
      const result = add(date, { months: 6 })

      expect(result.getMonth()).toBe(6) // July
      expect(result.getDate()).toBe(15)
    })
  })

  describe('adding hours', () => {
    it('should add hours to date', () => {
      const date = new Date('2025-01-15T12:00:00.000Z')
      const result = add(date, { hours: 2 })

      expect(result.getHours()).toBe(14)
    })

    it('should roll over days when adding hours', () => {
      const date = new Date('2025-01-15T23:00:00.000Z')
      const result = add(date, { hours: 2 })

      expect(result.getDate()).toBe(16)
      expect(result.getHours()).toBe(1)
    })
  })

  describe('adding combined durations', () => {
    it('should add multiple units', () => {
      const date = new Date('2025-01-15T12:30:00.000Z')
      const result = add(date, {
        days: 1,
        hours: 2,
        minutes: 30,
      })

      expect(result.getDate()).toBe(16)
      expect(result.getHours()).toBe(15) // 12 + 2 + 1 (from 60 minutes) = 15
      expect(result.getMinutes()).toBe(0) // 30 + 30 = 60, becomes 0 with hour rollover
    })
  })

  describe('immutability', () => {
    it('should not mutate original date', () => {
      const original = new Date('2025-01-15T00:00:00.000Z')
      const originalTime = original.getTime()

      add(original, { days: 7 })

      expect(original.getTime()).toBe(originalTime)
    })
  })
})

describe('subtract', () => {
  describe('subtracting days', () => {
    it('should subtract days from date', () => {
      const date = new Date('2025-01-15T00:00:00.000Z')
      const result = subtract(date, { days: 7 })

      expect(result.toISOString()).toBe('2025-01-08T00:00:00.000Z')
    })

    it('should subtract into previous month', () => {
      const date = new Date('2025-01-15T00:00:00.000Z')
      const result = subtract(date, { days: 20 })

      expect(result.getMonth()).toBe(11) // December
      expect(result.getFullYear()).toBe(2024)
    })
  })

  describe('subtracting months', () => {
    it('should subtract months from date', () => {
      const date = new Date('2025-03-15T00:00:00.000Z')
      const result = subtract(date, { months: 1 })

      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(15)
    })
  })

  describe('immutability', () => {
    it('should not mutate original date', () => {
      const original = new Date('2025-01-15T00:00:00.000Z')
      const originalTime = original.getTime()

      subtract(original, { days: 7 })

      expect(original.getTime()).toBe(originalTime)
    })
  })
})

describe('startOf', () => {
  describe('start of day', () => {
    it('should get start of day', () => {
      const date = new Date('2025-01-15T15:30:45.123Z')
      const result = startOf(date, 'day')

      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
      expect(result.getDate()).toBe(15)
    })
  })

  describe('start of month', () => {
    it('should get start of month', () => {
      const date = new Date('2025-01-15T15:30:45.123Z')
      const result = startOf(date, 'month')

      expect(result.getDate()).toBe(1)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })
  })

  describe('start of year', () => {
    it('should get start of year', () => {
      const date = new Date('2025-06-15T15:30:45.123Z')
      const result = startOf(date, 'year')

      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(1)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })
  })

  describe('immutability', () => {
    it('should not mutate original date', () => {
      const original = new Date('2025-01-15T15:30:45.123Z')
      const originalTime = original.getTime()

      startOf(original, 'day')

      expect(original.getTime()).toBe(originalTime)
    })
  })
})

describe('endOf', () => {
  describe('end of day', () => {
    it('should get end of day', () => {
      const date = new Date('2025-01-15T15:30:45.123Z')
      const result = endOf(date, 'day')

      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
      expect(result.getMilliseconds()).toBe(999)
      expect(result.getDate()).toBe(15)
    })
  })

  describe('end of month', () => {
    it('should get end of January (31 days)', () => {
      const date = new Date('2025-01-15T15:30:45.123Z')
      const result = endOf(date, 'month')

      expect(result.getDate()).toBe(31)
      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
      expect(result.getMilliseconds()).toBe(999)
    })

    it('should get end of February (28 days non-leap year)', () => {
      const date = new Date('2025-02-15T15:30:45.123Z')
      const result = endOf(date, 'month')

      expect(result.getDate()).toBe(28)
    })

    it('should get end of February (29 days leap year)', () => {
      const date = new Date('2024-02-15T15:30:45.123Z')
      const result = endOf(date, 'month')

      expect(result.getDate()).toBe(29)
    })
  })

  describe('end of year', () => {
    it('should get end of year', () => {
      const date = new Date('2025-06-15T15:30:45.123Z')
      const result = endOf(date, 'year')

      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(11) // December
      expect(result.getDate()).toBe(31)
      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
      expect(result.getMilliseconds()).toBe(999)
    })
  })

  describe('immutability', () => {
    it('should not mutate original date', () => {
      const original = new Date('2025-01-15T15:30:45.123Z')
      const originalTime = original.getTime()

      endOf(original, 'day')

      expect(original.getTime()).toBe(originalTime)
    })
  })
})
