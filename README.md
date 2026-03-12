# @lpm.dev/neo.date

> Zero-dependency date library — tree-shakeable, TypeScript-first alternative to date-fns and moment.js

Uses **native Intl APIs** (no custom parsers, no locale data to ship) — giving you accurate locale-aware formatting with zero bundle cost.

## Features

- ✅ **Zero dependencies** — No external runtime dependencies
- ✅ **Tree-shakeable** — Import only what you need (~300 bytes per function)
- ✅ **TypeScript-first** — Strict types, full IntelliSense
- ✅ **Immutable** — All operations return new `Date` objects
- ✅ **Native Intl** — Locale-aware formatting via `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat`
- ✅ **Timezone support** — IANA timezone names supported natively
- ✅ **ESM + CJS** — Works in Node.js 18+ and modern browsers

## Install

```bash
lpm install @lpm.dev/neo.date
```

## Usage

```typescript
import { format, add, diff, formatRelative } from '@lpm.dev/neo.date'

// Format a date
format(new Date(), { dateStyle: 'medium' })
// => 'Jan 15, 2025'

// Add duration (immutable)
const tomorrow = add(new Date(), { days: 1 })

// Difference between dates
diff(tomorrow, new Date(), 'days')
// => 1

// Relative time
formatRelative(new Date(Date.now() - 2 * 60 * 60 * 1000))
// => '2 hours ago'
```

## API

### `format(date, options?)`

Format a date using `Intl.DateTimeFormat`. Locale-aware, timezone-aware, zero bundle cost.

```typescript
import { format } from '@lpm.dev/neo.date'

// Preset styles
format(new Date(), { dateStyle: 'medium' })               // 'Jan 15, 2025'
format(new Date(), { dateStyle: 'full' })                 // 'Wednesday, January 15, 2025'
format(new Date(), { timeStyle: 'short' })                // '3:45 PM'
format(new Date(), { dateStyle: 'short', timeStyle: 'short' }) // '1/15/25, 3:45 PM'

// Component-level control
format(new Date(), { year: 'numeric', month: 'long', day: 'numeric' })
// 'January 15, 2025'

// Locale
format(new Date(), { dateStyle: 'long', locale: 'fr-FR' })
// '15 janvier 2025'

// Timezone
format(new Date(), { timeStyle: 'short', timeZone: 'America/New_York' })
// '10:45 AM'
```

**Options** (`FormatOptions`):
| Option | Type | Description |
|--------|------|-------------|
| `locale` | `string` | BCP 47 locale tag (default: `'en-US'`) |
| `timeZone` | `string` | IANA timezone (e.g. `'America/New_York'`) |
| `dateStyle` | `'full' \| 'long' \| 'medium' \| 'short'` | Preset date format |
| `timeStyle` | `'full' \| 'long' \| 'medium' \| 'short'` | Preset time format |
| `year` | `'numeric' \| '2-digit'` | Year component |
| `month` | `'numeric' \| '2-digit' \| 'long' \| 'short' \| 'narrow'` | Month component |
| `day` | `'numeric' \| '2-digit'` | Day component |
| `hour` | `'numeric' \| '2-digit'` | Hour component |
| `minute` | `'numeric' \| '2-digit'` | Minute component |
| `second` | `'numeric' \| '2-digit'` | Second component |
| `hour12` | `boolean` | 12-hour clock |

### `formatISO(date, options?)`

Format a date as ISO 8601 / RFC 3339.

```typescript
import { formatISO } from '@lpm.dev/neo.date'

formatISO(new Date('2025-01-15T15:30:00Z'))
// => '2025-01-15T15:30:00.000Z'

formatISO(new Date(), { representation: 'date' })
// => '2025-01-15'

formatISO(new Date(), { representation: 'time' })
// => '15:30:00.000Z'
```

**Options** (`ISOFormatOptions`):
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `representation` | `'complete' \| 'date' \| 'time'` | `'complete'` | What to include in output |

### `formatRelative(date, baseDate?, options?)`

Format a date as a human-readable relative time string using `Intl.RelativeTimeFormat`.

```typescript
import { formatRelative } from '@lpm.dev/neo.date'

const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
formatRelative(twoHoursAgo)
// => '2 hours ago'

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
formatRelative(tomorrow)
// => 'in 1 day'

// With locale
formatRelative(twoHoursAgo, new Date(), { locale: 'es' })
// => 'hace 2 horas'

// With style
formatRelative(twoHoursAgo, new Date(), { style: 'short' })
// => '2 hr. ago'
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | `Date` | — | Date to format |
| `baseDate` | `Date` | `new Date()` | Reference date (defaults to now) |
| `options.locale` | `string` | `'en-US'` | BCP 47 locale tag |
| `options.style` | `'long' \| 'short' \| 'narrow'` | `'long'` | Output verbosity |

### `parseISO(dateString)`

Parse an ISO 8601 or RFC 3339 date string into a `Date` object.

```typescript
import { parseISO } from '@lpm.dev/neo.date'

parseISO('2025-01-15T15:30:00.000Z')  // Date object
parseISO('2025-01-15')                 // Date object (midnight UTC)
parseISO('2025-01-15T15:30:00-05:00') // Date object (RFC 3339 with offset)

// Throws on invalid input
parseISO('not-a-date') // Error: Invalid ISO date string: not-a-date
```

### `add(date, duration)`

Add a duration to a date. **Immutable** — returns a new `Date`.

```typescript
import { add } from '@lpm.dev/neo.date'

const date = new Date('2025-01-15')

add(date, { days: 7 })                  // 2025-01-22
add(date, { months: 1 })               // 2025-02-15
add(date, { hours: 2, minutes: 30 })   // 2025-01-15 02:30
add(date, { years: 1, months: 2, days: 3 }) // 2026-03-18
```

**Duration fields** (all optional): `years`, `months`, `days`, `hours`, `minutes`, `seconds`, `milliseconds`

### `subtract(date, duration)`

Subtract a duration from a date. **Immutable** — returns a new `Date`.

```typescript
import { subtract } from '@lpm.dev/neo.date'

const date = new Date('2025-01-15')

subtract(date, { days: 7 })   // 2025-01-08
subtract(date, { months: 1 }) // 2024-12-15
```

### `startOf(date, unit)`

Get the start of a time unit for a date.

```typescript
import { startOf } from '@lpm.dev/neo.date'

const date = new Date('2025-01-15T14:30:45.500')

startOf(date, 'day')    // 2025-01-15T00:00:00.000
startOf(date, 'month')  // 2025-01-01T00:00:00.000
startOf(date, 'year')   // 2025-01-01T00:00:00.000
startOf(date, 'hour')   // 2025-01-15T14:00:00.000
```

### `endOf(date, unit)`

Get the end of a time unit for a date.

```typescript
import { endOf } from '@lpm.dev/neo.date'

const date = new Date('2025-01-15T14:30:45.500')

endOf(date, 'day')    // 2025-01-15T23:59:59.999
endOf(date, 'month')  // 2025-01-31T23:59:59.999
endOf(date, 'year')   // 2025-12-31T23:59:59.999
```

### `diff(dateLeft, dateRight, unit)`

Calculate the difference between two dates in the specified unit.

```typescript
import { diff } from '@lpm.dev/neo.date'

const date1 = new Date('2025-01-15')
const date2 = new Date('2025-01-20')

diff(date2, date1, 'days')         // 5
diff(date2, date1, 'hours')        // 120
diff(date1, date2, 'days')         // -5 (negative if left is earlier)
diff(date2, date1, 'milliseconds') // 432000000
```

**Units:** `'years'`, `'months'`, `'days'`, `'hours'`, `'minutes'`, `'seconds'`, `'milliseconds'`

### `compare(dateLeft, dateRight)`

Compare two dates. Returns `-1`, `0`, or `1`.

```typescript
import { compare } from '@lpm.dev/neo.date'

compare(new Date('2025-01-15'), new Date('2025-01-20')) // -1
compare(new Date('2025-01-20'), new Date('2025-01-15')) //  1
compare(new Date('2025-01-15'), new Date('2025-01-15')) //  0
```

### `isEqual(dateLeft, dateRight)`

```typescript
import { isEqual } from '@lpm.dev/neo.date'

isEqual(new Date('2025-01-15'), new Date('2025-01-15')) // true
isEqual(new Date('2025-01-15'), new Date('2025-01-16')) // false
```

### `isBefore(date, dateToCompare)` / `isAfter(date, dateToCompare)`

```typescript
import { isBefore, isAfter } from '@lpm.dev/neo.date'

const earlier = new Date('2025-01-15')
const later   = new Date('2025-01-20')

isBefore(earlier, later) // true
isAfter(later, earlier)  // true
```

### `isValid(date)`

```typescript
import { isValid } from '@lpm.dev/neo.date'

isValid(new Date())            // true
isValid(new Date('invalid'))   // false
isValid(new Date('2025-01-15')) // true
```

## TypeScript

Full type support:

```typescript
import type { Duration, FormatOptions, RelativeTimeOptions, ISOFormatOptions, TimeUnit } from '@lpm.dev/neo.date'

const duration: Duration = { days: 7, hours: 2 }
const opts: FormatOptions = { dateStyle: 'medium', locale: 'fr-FR' }
```

## Migration from `date-fns`

```diff
- import { format, addDays, differenceInDays } from 'date-fns'
+ import { format, add, diff } from '@lpm.dev/neo.date'

- format(new Date(), 'yyyy-MM-dd')
+ format(new Date(), { year: 'numeric', month: '2-digit', day: '2-digit' })

- addDays(date, 7)
+ add(date, { days: 7 })

- differenceInDays(date2, date1)
+ diff(date2, date1, 'days')
```

**Note:** `format()` uses `Intl.DateTimeFormat` options instead of format strings — more powerful for locale support, slightly different syntax.

## License

MIT
