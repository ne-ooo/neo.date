/**
 * @lpm.dev/neo.date
 *
 * Zero-dependency date parsing, formatting, and manipulation
 * Modern, tree-shakeable alternative to date-fns and moment.js
 *
 * Features:
 * - Zero runtime dependencies
 * - Immutable operations (all functions return new dates)
 * - Tree-shakeable (import only what you need)
 * - TypeScript-first with strict types
 * - Uses native Intl APIs (DateTimeFormat, RelativeTimeFormat)
 * - Correct DST handling
 * - Native timezone support
 *
 * @example
 * ```ts
 * import { format, add, diff } from '@lpm.dev/neo.date'
 *
 * // Formatting
 * format(new Date(), { dateStyle: 'medium' }) // 'Jan 15, 2025'
 *
 * // Manipulation
 * const tomorrow = add(new Date(), { days: 1 })
 *
 * // Comparison
 * diff(tomorrow, new Date(), 'days') // 1
 * ```
 */

// Export types
export type * from './types.js'

// Export formatters (tree-shakeable)
export { format } from './formatters/format.js'
export { formatISO } from './formatters/formatISO.js'
export { formatRelative } from './formatters/formatRelative.js'

// Export parsers
export { parseISO } from './parsers/parseISO.js'

// Export manipulators (tree-shakeable)
export { add } from './manipulators/add.js'
export { subtract } from './manipulators/subtract.js'
export { startOf } from './manipulators/startOf.js'
export { endOf } from './manipulators/endOf.js'

// Export utilities (tree-shakeable)
export { isValid } from './utils/isValid.js'
export { diff } from './utils/diff.js'
export {
  compare,
  isEqual,
  isBefore,
  isAfter,
} from './utils/compare.js'
