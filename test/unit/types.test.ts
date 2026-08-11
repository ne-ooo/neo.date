import { describe, expect, it } from 'vitest'
import type {
  BoundaryUnit,
  DifferenceUnit,
  FormatOptions,
  TimeUnit,
} from '../../src/index.js'

describe('public API types', () => {
  it('accepts the complete Intl.DateTimeFormat option surface', () => {
    const options: FormatOptions = {
      locale: 'en-US',
      calendar: 'gregory',
      numberingSystem: 'latn',
      weekday: 'long',
      era: 'short',
      hourCycle: 'h23',
      fractionalSecondDigits: 3,
      timeZoneName: 'shortOffset',
    }

    expect(options.weekday).toBe('long')
  })

  it('distinguishes base, boundary, and difference units', () => {
    const unit: TimeUnit = 'millisecond'
    const boundary: BoundaryUnit = 'second'
    const difference: DifferenceUnit = 'milliseconds'

    expect([unit, boundary, difference]).toEqual([
      'millisecond',
      'second',
      'milliseconds',
    ])
  })
})
