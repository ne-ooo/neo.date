const FORMATTER_CACHE_LIMIT = 32
const MAX_CACHE_KEY_LENGTH = 512
const MAX_LOCALE_LENGTH = 256
const MAX_OPTION_STRING_LENGTH = 256

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

type IntlOptionValue = string | number | boolean
type OptionsKey = (string | number | boolean)[]

/**
 * Reuse the expensive Intl formatter while keeping user-controlled cache
 * cardinality bounded.
 */
export function getDateTimeFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const optionsKey = getOptionsKey(options, DATE_TIME_OPTION_KEYS)
  const canonicalLocale = getCanonicalLocale(locale)
  const key = JSON.stringify([
    canonicalLocale,
    getDefaultTimeZoneKey(hasOption(optionsKey, 'timeZone')),
    optionsKey,
  ])

  if (key.length <= MAX_CACHE_KEY_LENGTH) {
    const cached = getCached(dateTimeFormatters, key)
    if (cached !== undefined) return cached
  }

  const formatter = new Intl.DateTimeFormat(
    canonicalLocale,
    createOptionsSnapshot<Intl.DateTimeFormatOptions>(optionsKey)
  )
  return key.length > MAX_CACHE_KEY_LENGTH
    ? formatter
    : cacheValue(dateTimeFormatters, key, formatter)
}

/**
 * Reuse the expensive Intl formatter while keeping user-controlled cache
 * cardinality bounded.
 */
export function getRelativeTimeFormatter(
  locale: string,
  options: Intl.RelativeTimeFormatOptions
): Intl.RelativeTimeFormat {
  const optionsKey = getOptionsKey(options, [
    'localeMatcher',
    'numeric',
    'style',
  ])
  const canonicalLocale = getCanonicalLocale(locale)
  const key = JSON.stringify([canonicalLocale, optionsKey])

  if (key.length <= MAX_CACHE_KEY_LENGTH) {
    const cached = getCached(relativeTimeFormatters, key)
    if (cached !== undefined) return cached
  }

  const formatter = new Intl.RelativeTimeFormat(
    canonicalLocale,
    createOptionsSnapshot<Intl.RelativeTimeFormatOptions>(optionsKey)
  )
  return key.length > MAX_CACHE_KEY_LENGTH
    ? formatter
    : cacheValue(relativeTimeFormatters, key, formatter)
}

/** Only exported from this internal module to keep tests deterministic. */
export function clearIntlFormatterCaches(): void {
  dateTimeFormatters.clear()
  relativeTimeFormatters.clear()
  canonicalLocales.clear()
}

function getCanonicalLocale(locale: string): string {
  if (typeof locale !== 'string' || locale.length > MAX_LOCALE_LENGTH) {
    throw new RangeError(
      `locale must be a string no longer than ${MAX_LOCALE_LENGTH} characters`
    )
  }

  const cached = getCached(canonicalLocales, locale)
  if (cached !== undefined) return cached
  return cacheValue(canonicalLocales, locale, canonicalizeLocale(locale))
}

function canonicalizeLocale(locale: string): string {
  const [canonicalLocale] = Intl.getCanonicalLocales(locale)
  return canonicalLocale ?? locale
}

function getDefaultTimeZoneKey(
  hasExplicitTimeZone: boolean
): string | undefined {
  if (hasExplicitTimeZone) return undefined

  // Node supports changing the default time zone through process.env.TZ at
  // runtime. Include it so a cached formatter cannot retain the old zone.
  return typeof process === 'undefined' ? undefined : process.env.TZ
}

function getOptionsKey(
  options: object,
  keys: readonly string[]
): OptionsKey {
  const entries: OptionsKey = []
  const values = options as Record<string, unknown>

  for (const key of keys) {
    const value = Object.hasOwn(values, key) ? values[key] : undefined
    if (value !== undefined) {
      validateOptionValue(key, value)
      entries.push(key, typeof value, value)
    }
  }

  return entries
}

function hasOption(entries: OptionsKey, option: string): boolean {
  for (let index = 0; index < entries.length; index += 3) {
    if (entries[index] === option) return true
  }
  return false
}

function createOptionsSnapshot<T extends object>(entries: OptionsKey): T {
  const snapshot: Record<string, IntlOptionValue> = {}

  for (let index = 0; index < entries.length; index += 3) {
    const key = entries[index] as string
    const value = entries[index + 2] as IntlOptionValue
    snapshot[key] = value
  }

  return snapshot as T
}

function validateOptionValue(
  key: string,
  value: unknown
): asserts value is string | number | boolean {
  if (key === 'hour12') {
    if (typeof value !== 'boolean') throwInvalidOption(key)
    return
  }

  if (key === 'fractionalSecondDigits') {
    if (!Number.isInteger(value) || (value as number) < 1 || (value as number) > 3) {
      throwInvalidOption(key)
    }
    return
  }

  if (typeof value !== 'string') throwInvalidOption(key)
  if (value.length > MAX_OPTION_STRING_LENGTH) {
    throw new RangeError(
      `${key} must be no longer than ${MAX_OPTION_STRING_LENGTH} characters`
    )
  }
}

function throwInvalidOption(key: string): never {
  throw new RangeError(`Invalid Intl option: ${key}`)
}

function getCached<K, V>(cache: Map<K, V>, key: K): V | undefined {
  const cached = cache.get(key)
  if (cached !== undefined) {
    cache.delete(key)
    cache.set(key, cached)
  }
  return cached
}

function cacheValue<K, V>(cache: Map<K, V>, key: K, value: V): V {
  if (cache.size >= FORMATTER_CACHE_LIMIT) {
    const oldestKey = cache.keys().next().value
    if (oldestKey !== undefined) {
      cache.delete(oldestKey)
    }
  }
  cache.set(key, value)
  return value
}
