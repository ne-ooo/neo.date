export function getValidDateTime(value: unknown, parameter = 'date'): number {
  let timestamp: number

  try {
    timestamp = Date.prototype.getTime.call(value)
  } catch {
    throw new RangeError(`${parameter} must be a valid Date`)
  }

  if (!Number.isFinite(timestamp)) {
    throw new RangeError(`${parameter} must be a valid Date`)
  }

  return timestamp
}

export function cloneValidDate(date: Date, parameter = 'date'): Date {
  return new Date(getValidDateTime(date, parameter))
}
