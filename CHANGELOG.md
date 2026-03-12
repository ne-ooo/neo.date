# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] - 2026-03-09

### Added

- `format(date, options?)` — Locale-aware date formatting via `Intl.DateTimeFormat`; supports `dateStyle`, `timeStyle`, individual components, `locale`, and IANA `timeZone`
- `formatISO(date, options?)` — ISO 8601 / RFC 3339 output with `complete`, `date`, and `time` representations
- `formatRelative(date, baseDate?, options?)` — Human-readable relative time ("2 hours ago", "in 3 days") via `Intl.RelativeTimeFormat`
- `parseISO(dateString)` — Parse ISO 8601 and RFC 3339 strings into `Date` objects; throws on invalid input
- `add(date, duration)` — Immutable date addition supporting `years`, `months`, `days`, `hours`, `minutes`, `seconds`, `milliseconds`
- `subtract(date, duration)` — Immutable date subtraction
- `startOf(date, unit)` — Get start of day, month, year, hour, etc.
- `endOf(date, unit)` — Get end of day, month, year, hour, etc.
- `diff(dateLeft, dateRight, unit)` — Difference between two dates in any time unit
- `compare(dateLeft, dateRight)` — Sort-compatible comparison returning -1, 0, or 1
- `isEqual(dateLeft, dateRight)` — Strict date equality
- `isBefore(date, dateToCompare)` — Before comparison
- `isAfter(date, dateToCompare)` — After comparison
- `isValid(date)` — Validate a `Date` object
- Full TypeScript types: `Duration`, `FormatOptions`, `RelativeTimeOptions`, `ISOFormatOptions`, `TimeUnit`
- Zero runtime dependencies — uses native Intl APIs
- ESM + CJS dual output with TypeScript declaration files
- Tree-shakeable exports — each function independently importable
