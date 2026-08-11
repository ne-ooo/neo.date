const FORMATTER_CACHE_LIMIT = 32
const MAX_CACHE_KEY_LENGTH = 512

const DATE_TIME_OPTION_KEYS = [
  'localeMatcher',
  'calendar',
  'numberingSystem',
  'hour12',
  'hourCycle',
  'timeZone',
  'weekday',
  'era',
  'year',
  'month',
  'day',
  'dayPeriod',
  'hour',
  'minute',
  'second',
  'fractionalSecondDigits',
  'timeZoneName',
  'formatMatcher',
  'dateStyle',
  'timeStyle',
] as const

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>()
const relativeTimeFormatters = new Map<string, Intl.RelativeTimeFormat>()
const canonicalLocales = new Map<string, string>()

/**
 * Reuse the expensive Intl formatter while keeping user-controlled cache
 * cardinality bounded.
 */
export function getDateTimeFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const canonicalLocale = getCanonicalLocale(locale)
  const key = JSON.stringify([
    canonicalLocale,
    getDefaultTimeZoneKey(options),
    getOptionsKey(options, DATE_TIME_OPTION_KEYS),
  ])
  const create = () => new Intl.DateTimeFormat(canonicalLocale, options)

  return key.length > MAX_CACHE_KEY_LENGTH
    ? create()
    : getOrCreate(dateTimeFormatters, key, create)
}

/**
 * Reuse the expensive Intl formatter while keeping user-controlled cache
 * cardinality bounded.
 */
export function getRelativeTimeFormatter(
  locale: string,
  options: Intl.RelativeTimeFormatOptions
): Intl.RelativeTimeFormat {
  const canonicalLocale = getCanonicalLocale(locale)
  const key = JSON.stringify([
    canonicalLocale,
    getOptionsKey(options, ['localeMatcher', 'numeric', 'style']),
  ])
  const create = () => new Intl.RelativeTimeFormat(canonicalLocale, options)

  return key.length > MAX_CACHE_KEY_LENGTH
    ? create()
    : getOrCreate(relativeTimeFormatters, key, create)
}

/** Only exported from this internal module to keep tests deterministic. */
export function clearIntlFormatterCaches(): void {
  dateTimeFormatters.clear()
  relativeTimeFormatters.clear()
  canonicalLocales.clear()
}

function getCanonicalLocale(locale: string): string {
  if (locale.length > MAX_CACHE_KEY_LENGTH) {
    return canonicalizeLocale(locale)
  }

  return getOrCreate(canonicalLocales, locale, () => canonicalizeLocale(locale))
}

function canonicalizeLocale(locale: string): string {
  const [canonicalLocale] = Intl.getCanonicalLocales(locale)
  return canonicalLocale ?? locale
}

function getDefaultTimeZoneKey(
  options: Intl.DateTimeFormatOptions
): string | undefined {
  if (options.timeZone !== undefined) {
    return undefined
  }

  // Node supports changing the default time zone through process.env.TZ at
  // runtime. Include it so a cached formatter cannot retain the old zone.
  return typeof process === 'undefined' ? undefined : process.env.TZ
}

function getOptionsKey(
  options: object,
  keys: readonly string[]
): [string, string, string][] {
  const entries: [string, string, string][] = []
  const values = options as Record<string, unknown>

  for (const key of keys) {
    const value = values[key]
    if (value !== undefined) {
      entries.push([key, typeof value, String(value)])
    }
  }

  return entries
}

function getOrCreate<K, V>(
  cache: Map<K, V>,
  key: K,
  create: () => V
): V {
  const cached = cache.get(key)
  if (cached !== undefined) {
    cache.delete(key)
    cache.set(key, cached)
    return cached
  }

  const value = create()
  if (cache.size >= FORMATTER_CACHE_LIMIT) {
    const oldestKey = cache.keys().next().value
    if (oldestKey !== undefined) {
      cache.delete(oldestKey)
    }
  }
  cache.set(key, value)
  return value
}
