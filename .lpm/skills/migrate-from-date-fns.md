---
name: migrate-from-date-fns
description: Step-by-step guide for migrating from date-fns to neo.date — format patterns to Intl options, clamping vs rolling, free locale support, missing features, and performance tradeoffs
version: "1.0.0"
globs:
  - "**/*.ts"
  - "**/*.js"
---

# Migrate from date-fns to @lpm.dev/neo.date

## Quick Comparison

| Aspect | date-fns | neo.date |
|--------|----------|----------|
| Dependencies | Zero (but large bundle) | Zero (smaller bundle) |
| Bundle size | 40-80KB (tree-shaken) | ~6KB |
| Format API | Pattern strings (`'yyyy-MM-dd'`) | Intl options object |
| Parse API | Pattern + reference date | ISO strings only |
| Month arithmetic | Clamps to last valid day | Rolls forward (native JS) |
| Locale support | Manual imports per locale | Free via `Intl` (all locales) |
| `diff` (days) | 658K ops/s | 19.8M ops/s (30x faster) |
| `parseISO` | 942K ops/s | 5.16M ops/s (5.5x faster) |
| `format` | 970K ops/s | 31.5K ops/s (31x slower) |

## Step 1: Replace Imports

```typescript
// Before (date-fns)
import { format, parseISO, addDays, differenceInDays } from 'date-fns'

// After (neo.date)
import { format, parseISO, add, diff } from '@lpm.dev/neo.date'
```

## Step 2: Migrate Formatting

### Pattern strings → Intl options

```typescript
// date-fns — pattern strings
format(date, 'yyyy-MM-dd')
format(date, 'MMMM d, yyyy')
format(date, 'HH:mm:ss')

// neo.date — Intl options
formatISO(date, { representation: 'date' })          // '2025-03-15'
format(date, { month: 'long', day: 'numeric', year: 'numeric' })  // 'March 15, 2025'
format(date, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

// Quick presets
format(date, { dateStyle: 'full' })     // 'Saturday, March 15, 2025'
format(date, { dateStyle: 'medium' })   // 'Mar 15, 2025'
format(date, { dateStyle: 'short' })    // '3/15/25'
```

### Common pattern mappings

| date-fns pattern | neo.date equivalent |
|-----------------|---------------------|
| `'yyyy-MM-dd'` | `formatISO(date, { representation: 'date' })` |
| `'yyyy-MM-dd HH:mm:ss'` | `formatISO(date)` (includes time) |
| `'MMMM d, yyyy'` | `format(date, { month: 'long', day: 'numeric', year: 'numeric' })` |
| `'MMM d'` | `format(date, { month: 'short', day: 'numeric' })` |
| `'h:mm a'` | `format(date, { hour: 'numeric', minute: '2-digit', hour12: true })` |
| `'EEEE'` | `format(date, { weekday: 'long' })` |

## Step 3: Migrate Locale Support

```typescript
// date-fns — import each locale manually
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
format(date, 'MMMM d, yyyy', { locale: fr })

// neo.date — all locales free via Intl
import { format } from '@lpm.dev/neo.date'
format(date, { locale: 'fr-FR', dateStyle: 'long' })
// → '15 mars 2025'
```

No locale imports needed. Pass any BCP 47 locale tag (`'en-US'`, `'ja-JP'`, `'ar-EG'`, etc.).

## Step 4: Migrate Manipulation

### add/subtract — function signatures differ

```typescript
// date-fns — separate functions per unit
import { addDays, addMonths, addHours, subDays } from 'date-fns'
addDays(date, 5)
addMonths(date, 1)
addHours(date, 2)
subDays(date, 3)

// neo.date — single function with Duration object
import { add, subtract } from '@lpm.dev/neo.date'
add(date, { days: 5 })
add(date, { months: 1 })
add(date, { hours: 2 })
subtract(date, { days: 3 })

// Combined durations in one call
add(date, { months: 1, days: 5, hours: 2 })
```

### Critical: Month clamping behavior differs

```typescript
// date-fns — clamps to last valid day
addMonths(new Date('2025-01-31'), 1)  // → Feb 28 (clamped)

// neo.date — rolls forward (native JS behavior)
add(new Date('2025-01-31'), { months: 1 })  // → Mar 3 (rolled)
```

If your code relies on date-fns clamping, add a workaround:

```typescript
function addMonthsClamped(date: Date, months: number): Date {
  const result = new Date(date.getTime())
  const targetMonth = result.getMonth() + months
  result.setMonth(targetMonth)
  if (result.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    result.setDate(0)
  }
  return result
}
```

### startOf / endOf

```typescript
// date-fns
import { startOfDay, startOfMonth, endOfDay, endOfMonth } from 'date-fns'
startOfDay(date)
endOfMonth(date)

// neo.date — single function with unit parameter
import { startOf, endOf } from '@lpm.dev/neo.date'
startOf(date, 'day')
endOf(date, 'month')
```

## Step 5: Migrate Diff and Comparisons

```typescript
// date-fns
import { differenceInDays, differenceInHours, isBefore, isAfter, isEqual } from 'date-fns'
differenceInDays(dateA, dateB)
differenceInHours(dateA, dateB)
isBefore(dateA, dateB)

// neo.date — single diff function with unit parameter
import { diff, isBefore, isAfter, isEqual } from '@lpm.dev/neo.date'
diff(dateA, dateB, 'days')
diff(dateA, dateB, 'hours')
isBefore(dateA, dateB)  // Same API
```

### formatDistance → formatRelative

```typescript
// date-fns
import { formatDistance } from 'date-fns'
formatDistance(date, new Date(), { addSuffix: true })
// → 'about 2 hours ago'

// neo.date
import { formatRelative } from '@lpm.dev/neo.date'
formatRelative(date)
// → '2 hours ago'
```

## Step 6: Handle Missing Features

### No pattern-based parsing

```typescript
// date-fns
import { parse } from 'date-fns'
parse('15/03/2025', 'dd/MM/yyyy', new Date())

// neo.date — ISO parsing only
import { parseISO } from '@lpm.dev/neo.date'
parseISO('2025-03-15')  // Works
// For custom format parsing, pre-process the string to ISO format
```

### Features with no neo.date equivalent

| date-fns function | Workaround |
|------------------|------------|
| `eachDayOfInterval` | Loop with `add(date, { days: 1 })` |
| `isWithinInterval` | `!isBefore(date, start) && !isAfter(date, end)` |
| `closestTo` | `dates.sort((a, b) => Math.abs(diff(a, target, 'ms')) - Math.abs(diff(b, target, 'ms')))[0]` |
| `intervalToDuration` | Multiple `diff()` calls per unit |
| `getISOWeek` | `Math.ceil((diff(date, startOf(date, 'year'), 'days') + 1) / 7)` |
| `format(date, pattern)` | Use `Intl.DateTimeFormat` options or `formatISO()` |
| `parse(str, pattern)` | Convert to ISO format first, then `parseISO()` |

## Performance Notes

neo.date is significantly faster for parsing, diff, and comparisons (5-72x). But `format()` is 31x slower because `Intl.DateTimeFormat` is constructed per call.

For hot paths formatting many dates, cache the formatter:

```typescript
const fmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
const formatted = dates.map(d => fmt.format(d))
```

## Migration Checklist

- [ ] Replace `import { ... } from 'date-fns'` with `@lpm.dev/neo.date`
- [ ] Convert format pattern strings to `FormatOptions` objects or `formatISO()`
- [ ] Replace `addDays/addMonths/addHours/...` with `add(date, { ... })`
- [ ] Replace `subDays/subMonths/...` with `subtract(date, { ... })`
- [ ] Replace `differenceInDays/differenceInHours/...` with `diff(date, date, unit)`
- [ ] Replace `startOfDay/startOfMonth/...` with `startOf(date, unit)`
- [ ] Replace `endOfDay/endOfMonth/...` with `endOf(date, unit)`
- [ ] Replace locale imports with `locale: 'xx-XX'` option strings
- [ ] Audit month arithmetic for clamping reliance — add workaround if needed
- [ ] Replace `formatDistance` with `formatRelative`
- [ ] Remove `date-fns` from dependencies
