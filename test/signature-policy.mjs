const missingTimestampText =
  'missing publish timestamp required to validate registry signature key expiry'

// LPM cannot fully verify these exact legacy package versions because the
// registry omits their publish timestamps. Keep this list exact so any new
// dependency or version must be reviewed instead of silently becoming a
// warning.
export const allowedMetadataGaps = new Set([
  '@jridgewell/resolve-uri@3.1.2',
  '@types/deep-eql@4.0.2',
  'any-promise@1.3.0',
  'assertion-error@2.0.1',
  'bundle-require@5.1.0',
  'cac@6.7.14',
  'chokidar@4.0.3',
  'commander@4.1.1',
  'confbox@0.1.8',
  'deep-eql@5.0.2',
  'estree-walker@3.0.3',
  'fsevents@2.3.3',
  'joycon@3.1.1',
  'js-tokens@9.0.1',
  'lilconfig@3.1.3',
  'lines-and-columns@1.2.4',
  'load-tsconfig@0.2.5',
  'ms@2.1.3',
  'mz@2.7.0',
  'object-assign@4.1.1',
  'picocolors@1.1.1',
  'pkg-types@1.3.1',
  'postcss-load-config@6.0.1',
  'resolve-from@5.0.0',
  'siginfo@2.0.0',
  'source-map-js@1.2.1',
  'stackback@0.0.2',
  'thenify@3.3.1',
  'thenify-all@1.6.0',
  'tinybench@2.9.0',
  'tinyexec@0.3.2',
  'tinyrainbow@2.0.0',
  'tree-kill@1.2.2',
  'ts-interface-checker@0.1.13',
  'undici-types@6.21.0',
  'why-is-node-running@2.3.0',
])

export function validateSignatureReport(report) {
  if (report === null || typeof report !== 'object' || Array.isArray(report)) {
    throw new Error('Dependency signature audit returned a malformed report')
  }

  const packages = report.packages
  if (!Array.isArray(packages)) {
    throw new Error('Dependency signature audit returned no package list')
  }

  for (const field of ['scanned', 'verified', 'not_verified', 'skipped']) {
    if (!Number.isSafeInteger(report[field]) || report[field] < 0) {
      throw new Error(`Dependency signature audit returned invalid ${field}`)
    }
  }

  if (report.skipped !== 0) {
    throw new Error('Dependency signature audit skipped one or more packages')
  }

  let verified = 0
  const metadataGaps = []

  for (const entry of packages) {
    if (
      entry === null ||
      typeof entry !== 'object' ||
      typeof entry.name !== 'string' ||
      typeof entry.version !== 'string'
    ) {
      throw new Error('Dependency signature audit returned a malformed package')
    }

    if (entry.status === 'verified') {
      verified += 1
      continue
    }

    if (entry.status !== 'not_verified') {
      throw new Error(
        `Dependency signature audit returned unknown status for ${entry.name}@${entry.version}`
      )
    }

    const packageId = `${entry.name}@${entry.version}`
    const expectedDetail =
      `verification failed: registry error: ${packageId} is ${missingTimestampText}`

    if (
      entry.reason !== 'verification_failed' ||
      entry.reason_detail !== expectedDetail ||
      !allowedMetadataGaps.has(packageId)
    ) {
      throw new Error(`Dependency signature verification failed for ${packageId}`)
    }

    metadataGaps.push(packageId)
  }

  if (
    packages.length !== report.scanned ||
    verified !== report.verified ||
    metadataGaps.length !== report.not_verified ||
    report.scanned !== report.verified + report.not_verified
  ) {
    throw new Error('Dependency signature audit totals do not match package results')
  }

  const expectedSuccess = metadataGaps.length === 0
  if (report.success !== expectedSuccess) {
    throw new Error('Dependency signature audit returned inconsistent success state')
  }

  return { verified, metadataGaps }
}
