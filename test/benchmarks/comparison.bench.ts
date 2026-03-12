import { bench, describe } from 'vitest'
import { format as dfFormat, parseISO as dfParseISO, addDays as dfAddDays, differenceInDays as dfDiff, isBefore as dfIsBefore } from 'date-fns'
import dayjs from 'dayjs'
import {
  format,
  formatISO,
  formatRelative,
  parseISO,
  add,
  subtract,
  diff,
  isBefore,
  startOf,
  endOf,
} from '../../src/index.js'

describe('neo.date vs date-fns vs dayjs - Performance Comparison', () => {
  describe('Date Formatting', () => {
    const date = new Date('2025-01-15T15:30:00.000Z')

    bench('neo.date - format (Intl API)', () => {
      format(date, { dateStyle: 'medium' })
    })

    bench('date-fns - format', () => {
      dfFormat(date, 'MMM dd, yyyy')
    })

    bench('dayjs - format', () => {
      dayjs(date).format('MMM DD, YYYY')
    })
  })

  describe('ISO Formatting', () => {
    const date = new Date('2025-01-15T15:30:00.000Z')

    bench('neo.date - formatISO', () => {
      formatISO(date)
    })

    bench('date-fns - toISOString', () => {
      date.toISOString()
    })

    bench('dayjs - toISOString', () => {
      dayjs(date).toISOString()
    })
  })

  describe('Relative Time Formatting', () => {
    const now = new Date()
    const past = new Date(now.getTime() - 2 * 60 * 60 * 1000)

    bench('neo.date - formatRelative', () => {
      formatRelative(past, now)
    })

    // Note: date-fns doesn't have built-in relative time formatting
    // dayjs requires a plugin for relative time
  })

  describe('Date Parsing', () => {
    const isoString = '2025-01-15T15:30:00.000Z'

    bench('neo.date - parseISO', () => {
      parseISO(isoString)
    })

    bench('date-fns - parseISO', () => {
      dfParseISO(isoString)
    })

    bench('dayjs - parseISO', () => {
      dayjs(isoString)
    })

    bench('native - new Date()', () => {
      new Date(isoString)
    })
  })

  describe('Date Manipulation - Add Days', () => {
    const date = new Date('2025-01-15T00:00:00.000Z')

    bench('neo.date - add days', () => {
      add(date, { days: 7 })
    })

    bench('date-fns - addDays', () => {
      dfAddDays(date, 7)
    })

    bench('dayjs - add days', () => {
      dayjs(date).add(7, 'day')
    })
  })

  describe('Date Manipulation - Subtract Days', () => {
    const date = new Date('2025-01-15T00:00:00.000Z')

    bench('neo.date - subtract days', () => {
      subtract(date, { days: 7 })
    })

    bench('date-fns - addDays (negative)', () => {
      dfAddDays(date, -7)
    })

    bench('dayjs - subtract days', () => {
      dayjs(date).subtract(7, 'day')
    })
  })

  describe('Start/End of Day', () => {
    const date = new Date('2025-01-15T15:30:45.123Z')

    bench('neo.date - startOf day', () => {
      startOf(date, 'day')
    })

    bench('dayjs - startOf day', () => {
      dayjs(date).startOf('day')
    })

    bench('neo.date - endOf day', () => {
      endOf(date, 'day')
    })

    bench('dayjs - endOf day', () => {
      dayjs(date).endOf('day')
    })
  })

  describe('Date Difference', () => {
    const date1 = new Date('2025-01-15')
    const date2 = new Date('2025-01-20')

    bench('neo.date - diff days', () => {
      diff(date2, date1, 'days')
    })

    bench('date-fns - differenceInDays', () => {
      dfDiff(date2, date1)
    })

    bench('dayjs - diff days', () => {
      dayjs(date2).diff(dayjs(date1), 'day')
    })
  })

  describe('Date Comparison', () => {
    const date1 = new Date('2025-01-15')
    const date2 = new Date('2025-01-20')

    bench('neo.date - isBefore', () => {
      isBefore(date1, date2)
    })

    bench('date-fns - isBefore', () => {
      dfIsBefore(date1, date2)
    })

    bench('dayjs - isBefore', () => {
      dayjs(date1).isBefore(dayjs(date2))
    })

    bench('native - comparison', () => {
      date1.getTime() < date2.getTime()
    })
  })

  describe('High-Volume Operations', () => {
    const dates = Array.from({ length: 100 }, (_, i) => new Date(2025, 0, i + 1))

    bench('neo.date - 100 format operations', () => {
      dates.forEach((date) => format(date, { dateStyle: 'medium' }))
    })

    bench('date-fns - 100 format operations', () => {
      dates.forEach((date) => dfFormat(date, 'MMM dd, yyyy'))
    })

    bench('dayjs - 100 format operations', () => {
      dates.forEach((date) => dayjs(date).format('MMM DD, YYYY'))
    })

    bench('neo.date - 100 add operations', () => {
      dates.forEach((date) => add(date, { days: 7 }))
    })

    bench('date-fns - 100 add operations', () => {
      dates.forEach((date) => dfAddDays(date, 7))
    })

    bench('dayjs - 100 add operations', () => {
      dates.forEach((date) => dayjs(date).add(7, 'day'))
    })

    bench('neo.date - 100 diff operations', () => {
      for (let i = 0; i < dates.length - 1; i++) {
        diff(dates[i + 1]!, dates[i]!, 'days')
      }
    })

    bench('date-fns - 100 diff operations', () => {
      for (let i = 0; i < dates.length - 1; i++) {
        dfDiff(dates[i + 1]!, dates[i]!)
      }
    })

    bench('dayjs - 100 diff operations', () => {
      for (let i = 0; i < dates.length - 1; i++) {
        dayjs(dates[i + 1]!).diff(dayjs(dates[i]!), 'day')
      }
    })
  })

  describe('Complex Workflow', () => {
    const isoString = '2025-01-15T15:30:00.000Z'

    bench('neo.date - parse + add + format', () => {
      const date = parseISO(isoString)
      const newDate = add(date, { days: 7, hours: 2 })
      formatISO(newDate)
    })

    bench('date-fns - parse + add + format', () => {
      const date = dfParseISO(isoString)
      const newDate = dfAddDays(date, 7)
      newDate.toISOString()
    })

    bench('dayjs - parse + add + format', () => {
      dayjs(isoString).add(7, 'day').add(2, 'hour').toISOString()
    })
  })
})
