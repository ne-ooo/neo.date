import { spawnSync } from 'node:child_process'
import { validateSignatureReport } from './signature-policy.mjs'

const lpmCommand = process.platform === 'win32' ? 'lpm.exe' : 'lpm'
const result = spawnSync(lpmCommand, ['audit', 'signatures', '--json'], {
  encoding: 'utf8',
})

if (result.error) throw result.error
if (result.status !== 0 && result.status !== 1) {
  throw new Error(
    `lpm audit signatures failed with exit code ${String(result.status)}`
  )
}

let report
try {
  report = JSON.parse(result.stdout)
} catch (error) {
  throw new Error('lpm audit signatures did not return valid JSON', {
    cause: error,
  })
}

const { verified, metadataGaps } = validateSignatureReport(report)
const expectedExitCode = metadataGaps.length === 0 ? 0 : 1
if (result.status !== expectedExitCode) {
  throw new Error('Dependency signature audit exit code did not match its report')
}

if (metadataGaps.length > 0) {
  console.warn(
    `Registry metadata cannot verify ${metadataGaps.length} package signatures because publish timestamps are missing.`
  )
}

console.log(
  `Dependency signatures: ${verified} verified, ${metadataGaps.length} reviewed metadata warnings.`
)
