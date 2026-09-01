export function assertOptionsObject(value: unknown): asserts value is object {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('options must be an object')
  }
}
