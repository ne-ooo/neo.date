---
name: anti-patterns
description: Common mistakes when using neo.date — month rollover instead of clamping, format pattern strings, parseISO calendar validation, diff flooring vs calendar math, sequential duration overflow
version: "1.0.0"
globs:
  - "**/*.ts"
  - "**/*.js"
---

# Anti-Patterns for @lpm.dev/neo.date

### [CRITICAL] Expecting add() to clamp months like date-fns

Wrong:

```typescript
// AI expects Feb 28 (clamped to last day of February)
const nextMonth = add(new Date('2025-01-31'), { months: 1 })
// Actually returns: 2025-03-03 (JS rolls Feb 31 → Mar 3)
```

Correct:

```typescript
// Option 1: Accept the native behavior and handle it
const nextMonth = add(new Date('2025-01-31'), { months: 1 })
// → Mar 3 — be aware this skips February

// Option 2: Implement clamping for billing/scheduling
function addMonthsClamped(date: Date, months: number): Date {
  const result = new Date(date.getTime())
  const targetMonth = result.getMonth() + months
  result.setMonth(targetMonth)
  if (result.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    result.setDate(0) // Day 0 = last day of previous month
  }
  return result
}
addMonthsClamped(new Date('2025-01-31'), 1) // → Feb 28
```

neo.date delegates to native `Date.setMonth()` which rolls forward on overflow. date-fns clamps to the last valid day. For billing cycles, scheduling, or any domain where "next month" means the same day or last day of target month, you need the clamping workaround.

Source: `src/manipulators/add.ts` — uses setMonth() directly, `test/unit/edge-cases.test.ts:162-169`

### [CRITICAL] parseISO doesn't validate calendar dates — silent rollover

Wrong:

```typescript
// AI assumes invalid dates throw
try {
  const birthday = parseISO(userInput) // '2025-02-29'
  saveBirthday(birthday) // Saves March 1 instead of rejecting!
} catch {
  showError('Invalid date')
}
```

Correct:

```typescript
function parseISOStrict(input: string): Date {
  const date = parseISO(input)
  const [year, month, day] = input.split('T')[0]!.split('-').map(Number)
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date: ${input}`)
  }
  return date
}

parseISOStrict('2025-02-29') // throws (2025 is not a leap year)
parseISOStrict('2024-02-29') // OK (2024 is a leap year)
```

`parseISO()` only checks `isNaN(date.getTime())`. JS Date silently rolls invalid dates forward — `'2025-02-29'` becomes March 1, `'2025-13-45'` rolls month and day. Only truly unparseable strings like `'not-a-date'` throw. Use round-trip validation to catch calendar errors.

Source: `src/parsers/parseISO.ts:23-25` — isNaN check only, maintainer interview

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

`diff(a, b, 'days')` floors the millisecond difference by 86,400,000. It returns 0 for any sub-24-hour gap, even across midnight. For calendar-day comparison, use `startOf()`.

Source: `src/utils/diff.ts:29-51` — Math.floor for time units, maintainer interview

### [HIGH] diff() uses different math for months/years vs smaller units

Wrong:

```typescript
// AI expects duration-style answers
diff(new Date('2025-12-31'), new Date('2025-01-01'), 'years')
// Returns: 0 (same year) — not 364/365 days worth of years
```

Correct:

```typescript
// Years/months = calendar subtraction
diff(new Date('2025-12-31'), new Date('2025-01-01'), 'years')   // 0 (same year)
diff(new Date('2026-01-01'), new Date('2025-12-31'), 'years')   // 1 (next year)

// Days/hours/etc = floored millisecond duration
diff(new Date('2025-12-31'), new Date('2025-01-01'), 'days')    // 364
```

Year diff uses `getFullYear() - getFullYear()`, month diff uses `(yearDiff * 12) + monthDiff`. These are calendar subtractions, not duration calculations. Smaller units (days, hours, etc.) use floored millisecond arithmetic. This inconsistency can surprise.

Source: `src/utils/diff.ts` — switch statement with different math per unit

### [MEDIUM] Combined duration causes compound overflow

Wrong:

```typescript
// AI expects atomic month+day math
add(new Date('2025-01-31'), { months: 1, days: 1 })
// Expected by AI: Feb 28 + 1 day = Mar 1
// Actually: setMonth(1) → Mar 3, then setDate(3+1) → Mar 4
```

Correct:

```typescript
// Understand that operations apply sequentially: years → months → days
// Month overflow happens BEFORE day addition
const step1 = add(new Date('2025-01-31'), { months: 1 }) // Mar 3
const step2 = add(step1, { days: 1 })                     // Mar 4

// If you need clamped behavior, clamp months first, then add days
const clamped = addMonthsClamped(new Date('2025-01-31'), 1) // Feb 28
const final = add(clamped, { days: 1 })                      // Mar 1
```

Duration fields are applied in order (years, months, days, hours...). Month overflow compounds with subsequent day additions because each `set*` call mutates the intermediate Date.

Source: `src/manipulators/add.ts` — sequential if statements, maintainer interview

### [MEDIUM] diff() and formatRelative() disagree on rounding

Wrong:

```typescript
// AI uses both and expects consistency
const daysDiff = diff(recent, now, 'days')        // 0 (floored)
const relative = formatRelative(recent, now)       // '1 day ago' (rounded)
// 23.5 hours apart: diff says 0, formatRelative says 1
```

Correct:

```typescript
// Be aware of the difference:
// diff() uses Math.floor for time units
// formatRelative() uses Math.round for unit selection
// Pick one approach and use it consistently
```

`diff()` floors results. `formatRelative()` rounds for human-friendly output. The same time span can produce different numbers from each function.

Source: `src/utils/diff.ts` (Math.floor) vs `src/formatters/formatRelative.ts` (Math.round)
