---
name: getting-started
description: How to import and use neo.date — formatters, parsers, manipulators, utilities, Duration type, FormatOptions, Intl-based formatting, and immutability guarantees
version: "2.0.0"
globs:
  - "**/*.ts"
  - "**/*.js"
  - "**/*.tsx"
  - "**/*.jsx"
---

# Getting Started with @lpm.dev/neo.date

## Overview

neo.date provides 14 functions across 4 categories. All manipulation functions are immutable (return new Date instances). Formatting uses native `Intl` APIs — all locales are available with zero bundle cost.

## Formatters

### format() — Locale-aware display formatting

```typescript
import { format } from '@lpm.dev/neo.date'

// Quick styles
format(date, { dateStyle: 'full' })
// → 'Saturday, March 15, 2025'

format(date, { dateStyle: 'short', timeStyle: 'short' })
// → '3/15/25, 3:30 PM'

// Component-level control
format(date, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
// → 'March 15, 2025, 03:30 PM'

// With locale and timezone
format(date, {
  locale: 'fr-FR',
  timeZone: 'Europe/Paris',
  dateStyle: 'long',
})
// → '15 mars 2025'
```

`format()` accepts an options object (not pattern strings like `'yyyy-MM-dd'`). It uses `Intl.DateTimeFormat` internally.

### formatISO() — Machine-readable ISO 8601

```typescript
import { formatISO } from '@lpm.dev/neo.date'

formatISO(date)                                    // '2025-03-15T15:30:00.000Z'
formatISO(date, { representation: 'date' })        // '2025-03-15'
formatISO(date, { representation: 'time' })        // '15:30:00.000Z'
```

Uses native `toISOString()` — fast and locale-independent. Use this for APIs, databases, and serialization.

### formatRelative() — Human-friendly relative time

```typescript
import { formatRelative } from '@lpm.dev/neo.date'

formatRelative(twoHoursAgo)                        // '2 hours ago'
formatRelative(tomorrow)                           // 'in 1 day'
formatRelative(twoHoursAgo, now, { locale: 'es' }) // 'hace 2 horas'
formatRelative(date, base, { style: 'narrow' })    // '2h ago'
```

Auto-selects the appropriate unit (seconds → years). Uses `Intl.RelativeTimeFormat`.

## Parsers

### parseISO() — Parse ISO 8601 strings

```typescript
import { parseISO } from '@lpm.dev/neo.date'

parseISO('2025-03-15T15:30:00.000Z')     // Date object (UTC)
parseISO('2025-03-15')                    // Date object (date only)
parseISO('2025-03-15T10:30:00-05:00')     // Date object (with offset)

parseISO('not-a-date')                    // throws Error
parseISO('')                              // throws Error
```

`parseISO` validates its grammar and calendar values. Date-only and zone-less inputs use local civil time; `Z` and numeric offsets identify an absolute instant. Invalid values such as `'2025-02-29'` throw `RangeError`.

## Manipulators (Immutable)

All return new Date instances — the original is never mutated.

### add() and subtract()

```typescript
import { add, subtract } from '@lpm.dev/neo.date'

add(date, { months: 1, days: 5 })
add(date, { hours: 2, minutes: 30 })
subtract(date, { days: 7 })
subtract(date, { years: 1, months: 6 })
```

Duration fields (all optional): `years`, `months`, `days`, `hours`, `minutes`, `seconds`, `milliseconds`.

Years and months are combined into one calendar operation and clamp to the last valid target day. Days use local calendar arithmetic and preserve wall-clock time across DST. Hours and smaller units are exact elapsed durations. All duration values must be finite safe integers.

### startOf() and endOf()

```typescript
import { startOf, endOf } from '@lpm.dev/neo.date'

startOf(date, 'day')     // 2025-03-15T00:00:00.000
startOf(date, 'month')   // 2025-03-01T00:00:00.000
startOf(date, 'year')    // 2025-01-01T00:00:00.000

endOf(date, 'day')       // 2025-03-15T23:59:59.999
endOf(date, 'month')     // 2025-03-31T23:59:59.999 (handles variable-length months)
endOf(date, 'year')      // 2025-12-31T23:59:59.999
```

Units: `'year'`, `'month'`, `'day'`, `'hour'`, `'minute'`, `'second'`.

## Utilities

### diff() — Calculate differences

```typescript
import { diff } from '@lpm.dev/neo.date'

diff(laterDate, earlierDate, 'days')          // 30
diff(laterDate, earlierDate, 'hours')         // 720
diff(laterDate, earlierDate, 'milliseconds')  // 2592000000
```

Units: `'years'`, `'months'`, `'days'`, `'hours'`, `'minutes'`, `'seconds'`, `'milliseconds'`.

Returns signed values (negative if left < right). Years, months, and days count complete local-calendar units. Hours and smaller units are elapsed values truncated toward zero.

### Comparisons

```typescript
import { compare, isEqual, isBefore, isAfter, isValid } from '@lpm.dev/neo.date'

compare(dateA, dateB)     // -1, 0, or 1
isEqual(dateA, dateB)     // true if same millisecond
isBefore(dateA, dateB)    // true if dateA is earlier
isAfter(dateA, dateB)     // true if dateA is later
isValid(date)             // true if valid Date (not NaN)
```

## Tree-Shaking

The package is fully tree-shakeable (`sideEffects: false`). Import only what you need:

```typescript
// Only ~300 bytes per function
import { formatISO, parseISO, diff } from '@lpm.dev/neo.date'
```

## TypeScript Types

```typescript
import type {
  Duration,             // { years?, months?, days?, hours?, ... }
  TimeUnit,             // 'year' | 'month' | 'day' | ...
  BoundaryUnit,         // singular units accepted by startOf/endOf
  DifferenceUnit,       // plural units accepted by diff
  FormatOptions,        // Intl.DateTimeFormat options + locale
  RelativeTimeOptions,  // { locale?, style?, numeric? }
  ISOFormatOptions,     // { representation? }
} from '@lpm.dev/neo.date'
```
