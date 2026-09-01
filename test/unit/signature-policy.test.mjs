import { describe, expect, it } from 'vitest'
import {
  allowedMetadataGaps,
  validateSignatureReport,
} from '../signature-policy.mjs'

const [allowedPackageId] = allowedMetadataGaps
const separator = allowedPackageId.lastIndexOf('@')
const allowedName = allowedPackageId.slice(0, separator)
const allowedVersion = allowedPackageId.slice(separator + 1)
const missingTimestampDetail =
  `verification failed: registry error: ${allowedPackageId} is missing publish timestamp required to validate registry signature key expiry`

function report(packages, overrides = {}) {
  const verified = packages.filter((entry) => entry.status === 'verified').length
  const notVerified = packages.filter(
    (entry) => entry.status === 'not_verified'
  ).length

  return {
    success: notVerified === 0,
    scanned: packages.length,
    verified,
    not_verified: notVerified,
    skipped: 0,
    packages,
    ...overrides,
  }
}

describe('dependency signature policy', () => {
  it('accepts verified packages and the reviewed metadata baseline', () => {
    const result = validateSignatureReport(
      report([
        { name: 'verified-package', version: '1.0.0', status: 'verified' },
        {
          name: allowedName,
          version: allowedVersion,
          status: 'not_verified',
          reason: 'verification_failed',
          reason_detail: missingTimestampDetail,
        },
      ])
    )

    expect(result.verified).toBe(1)
    expect(result.metadataGaps).toEqual([allowedPackageId])
  })

  it('rejects a new package with the same metadata gap', () => {
    expect(() =>
      validateSignatureReport(
        report([
          {
            name: 'new-package',
            version: '1.0.0',
            status: 'not_verified',
            reason: 'verification_failed',
            reason_detail:
              'verification failed: registry error: new-package@1.0.0 is missing publish timestamp required to validate registry signature key expiry',
          },
        ])
      )
    ).toThrow('verification failed for new-package@1.0.0')
  })

  it('rejects unsigned or invalid signatures', () => {
    for (const reason of ['unsigned', 'invalid_signature']) {
      expect(() =>
        validateSignatureReport(
          report([
            {
              name: allowedName,
              version: allowedVersion,
              status: 'not_verified',
              reason,
              reason_detail: missingTimestampDetail,
            },
          ])
        )
      ).toThrow('verification failed')
    }
  })

  it('rejects skipped and unknown package statuses', () => {
    expect(() =>
      validateSignatureReport(report([], { skipped: 1 }))
    ).toThrow('skipped')
    expect(() =>
      validateSignatureReport(
        report([{ name: 'package', version: '1.0.0', status: 'unknown' }])
      )
    ).toThrow('unknown status')
  })

  it('rejects malformed reports and inconsistent totals', () => {
    expect(() => validateSignatureReport(null)).toThrow('malformed report')
    expect(() => validateSignatureReport({})).toThrow('no package list')
    expect(() =>
      validateSignatureReport(
        report(
          [{ name: 'package', version: '1.0.0', status: 'verified' }],
          { verified: 0 }
        )
      )
    ).toThrow('totals do not match')
  })
})
