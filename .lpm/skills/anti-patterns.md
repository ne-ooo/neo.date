---
name: anti-patterns
description: Common mistakes when using neo.date — strict ISO parsing, clamped calendar arithmetic, local-time boundaries, complete-unit differences, and Intl formatting options
version: "2.0.0"
globs:
  - "**/*.ts"
  - "**/*.js"
---

# Anti-Patterns for @lpm.dev/neo.date

### [CRITICAL] Expecting native month rollover from add()

Wrong:

```typescript
// Native Date.setMonth() would roll this into March.
const nextMonth = add(new Date('2025-01-31'), { months: 1 })
// neo.date intentionally returns February 28.
```

Correct:

```typescript
const nextMonth = add(new Date(2025, 0, 31), { months: 1 })
// → Feb 28 — safe for end-of-month billing and schedules
```

`add()` combines years and months into a clamped calendar operation. February 29 plus one year similarly becomes February 28. Use native setters directly only if rollover behavior is specifically required.

Source: `src/manipulators/add.ts` and `src/utils/calendar.ts` — clamped combined year/month arithmetic

### [CRITICAL] Passing non-ISO display strings to parseISO()

Wrong:

```typescript
parseISO('January 15, 2025')
// RangeError: Invalid ISO date string
```

Correct:

```typescript
parseISO('2025-01-15')                  // local midnight
parseISO('2025-01-15T12:30:00')        // local civil time
parseISO('2025-01-15T12:30:00Z')       // UTC instant
parseISO('2025-01-15T12:30:00-05:00')  // offset instant
parseISO('2025-02-29')                  // throws: impossible date
```

`parseISO()` accepts a strict ISO/RFC 3339 subset and validates calendar, time, and offset components. Convert localized display input to ISO before parsing; do not rely on the implementation-dependent native `Date` string parser.

Source: `src/parsers/parseISO.ts` — bounded grammar and component validation

### [HIGH] Passing format pattern strings to format()

Wrong:

```typescript
// date-fns muscle memory
format(date, 'yyyy-MM-dd HH:mm:ss')
// TypeError — format() doesn't accept pattern strings
```

Correct:

```typescript
// Use FormatOptions object with Intl options
format(date, { dateStyle: 'short', timeStyle: 'medium' })

// Or component-level control
format(date, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

// For ISO format, use formatISO
formatISO(date, { representation: 'date' }) // '2025-03-15'
```

neo.date uses `Intl.DateTimeFormat` options, not pattern strings. There is no pattern-based formatter. `dateStyle`/`timeStyle` or individual component options are the API.

Source: `src/formatters/format.ts:35` — passes options to Intl.DateTimeFormat, maintainer interview

### [HIGH] Using format() when you need ISO output

Wrong:

```typescript
import { format } from '@lpm.dev/neo.date'
const iso = format(date, { year: 'numeric', month: '2-digit', day: '2-digit' })
// Returns locale-dependent: '03/15/2025' (en-US) or '15/03/2025' (en-GB)
```

Correct:

```typescript
// For ISO strings, use formatISO
import { formatISO } from '@lpm.dev/neo.date'
formatISO(date, { representation: 'date' }) // '2025-03-15'

// Or native JS for simple cases
date.toISOString() // '2025-03-15T15:30:00.000Z'
```

`format()` always produces locale-formatted output via `Intl.DateTimeFormat`. There is no combination of options that produces ISO format. Use `formatISO()` or native `toISOString()`.

Source: `src/formatters/format.ts` vs `src/formatters/formatISO.ts`, maintainer interview

### [HIGH] Using diff() for "same calendar day" checks

Wrong:

```typescript
// AI assumes 0 days means same day
if (diff(dateA, dateB, 'days') === 0) {
  console.log('Same day!')
}
// 23h59m59s apart → diff returns 0, but could be different calendar days
// (e.g., 11:59 PM Monday vs 11:58 PM Monday = 0 days, correct)
// But Mar 15 23:00 vs Mar 16 01:00 = 0 days, WRONG — different days
```

Correct:

```typescript
import { startOf } from '@lpm.dev/neo.date'

// Same calendar day check
const sameDay = startOf(dateA, 'day').getTime() === startOf(dateB, 'day').getTime()
```

`diff(a, b, 'days')` counts complete local calendar-day periods. A short interval across midnight is still incomplete, so use `startOf()` when the question is whether two instants share a calendar date.

Source: `src/utils/diff.ts` — complete local calendar-unit calculation

### [HIGH] Treating every diff() unit as elapsed time

Wrong:

```typescript
// One local calendar day is not one complete year.
diff(new Date(2026, 0, 1), new Date(2025, 11, 31), 'years') // 0
```

Correct:

```typescript
// Calendar units count complete local periods.
diff(new Date(2026, 0, 1), new Date(2025, 0, 1), 'years') // 1
diff(new Date(2025, 1, 28), new Date(2025, 0, 31), 'months') // 1 (clamped)

// Sub-day units are elapsed time truncated toward zero.
diff(new Date(1_999), new Date(0), 'seconds') // 1
diff(new Date(0), new Date(1_999), 'seconds') // -1
```

Years, months, and days are complete local-calendar units. Hours, minutes, seconds, and milliseconds are elapsed units. Choose the unit according to whether the domain is scheduling or elapsed time.

Source: `src/utils/diff.ts` — switch statement with different math per unit

### [MEDIUM] Assuming all duration fields use the same clock

Wrong:

```typescript
// Adding one day across DST may be 23 or 25 elapsed hours.
const result = add(dateBeforeDst, { days: 1 })
```

Correct:

```typescript
add(new Date(2025, 0, 31), { months: 1, days: 1 }) // Mar 1

// Use hours for an exact elapsed duration.
add(dateBeforeDst, { hours: 24 })
```

Years/months and days are calendar operations. Hours and smaller fields are combined into one elapsed-time operation after the calendar portion. This distinction preserves scheduling intent across DST while keeping sub-day durations exact.

Source: `src/manipulators/add.ts` — calendar operations followed by elapsed milliseconds

### [MEDIUM] Using formatRelative() as a duration calculator

Wrong:

```typescript
const label = formatRelative(recent, now) // presentation text, rounded for humans
```

Correct:

```typescript
const completeDays = diff(recent, now, 'days')
const elapsedHours = diff(recent, now, 'hours')
```

`formatRelative()` selects a display unit using elapsed thresholds and rounds symmetrically. Use `diff()` for calculations and `formatRelative()` only for presentation.

Source: `src/utils/diff.ts` vs `src/formatters/formatRelative.ts`
