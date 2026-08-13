# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Security

- Reject locale identifiers longer than 256 characters before `Intl` canonicalization to prevent event-loop CPU exhaustion from attacker-controlled input.

### Performance

- Calculate local civil day numbers without temporary `Date` allocations when computing day differences.

### Changed

- Updated the pinned LPM CI toolchain and lockfile schema, and added dependency-signature verification to the package security job.

## [2.0.0] - 2026-08-03

### Changed

- `parseISO` now strictly validates ISO/RFC 3339 syntax and calendar values; date-only and zone-less inputs use local civil time.
- `add` and `subtract` now clamp years/months, preserve local wall-clock time for days, use elapsed time for sub-day units, and reject unsafe durations.
- `diff` now returns signed complete calendar units for years/months/days and truncates elapsed sub-day units toward zero.
- All public date operations now reject invalid `Date` values consistently.
- `formatRelative` now selects units by raw thresholds and defaults to numeric output.
- `format` and `formatRelative` now reuse locale-aware formatters through small bounded LRU caches.
- `FormatOptions` now supports the complete native `Intl.DateTimeFormatOptions` surface.
- Added explicit `BoundaryUnit` and `DifferenceUnit` types for singular boundary operations and plural `diff` units.
- Development tooling now uses patched Vitest and Vite versions with an LPM lockfile and a high-severity vulnerability gate for publishing.
- CI now verifies supported Node.js versions, timezone-sensitive behavior, dependency security, and packed ESM/CJS consumers.
- Package contents now include only publishable LPM skills, excluding local LPM install and audit state.
- LPM publish/check scripts now build before packaging.

## [1.0.0] - 2026-03-09

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
