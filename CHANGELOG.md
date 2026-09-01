# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Security

- Reject locale identifiers longer than 256 characters before `Intl` canonicalization to prevent event-loop CPU exhaustion from attacker-controlled input.
- Ignore inherited duration fields so prototype changes cannot alter date arithmetic.
- Reject oversized or non-primitive `Intl` option values before formatter construction.
- Reject invalid runtime values for boundary units, ISO representations, and formatter options.

### Performance

- Calculate local civil day numbers without temporary `Date` allocations when computing day differences.
- Remove temporary `Date`, array, and substring allocations from ISO formatting.
- Reduce allocations on formatter-cache hits with flat keys and option snapshots.

### Fixed

- Use compatible disambiguation for local ISO values in daylight-saving gaps.
- Preserve the requested wall time when month arithmetic crosses a midnight gap.
- Keep sub-day boundaries in the UTC-offset occurrence of the input during offset changes.
- Calculate calendar ends from the next local boundary to support repeated times and skipped dates.
- Return complete calendar differences at the limits of the JavaScript `Date` range.
- Combine large, canceling duration fields without numeric precision loss.
- Format date-only and time-only ISO output correctly for expanded years.

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
