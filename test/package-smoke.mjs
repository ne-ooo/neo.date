import assert from 'node:assert/strict'
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const temporaryRoot = await mkdtemp(join(tmpdir(), 'neo-date-package-'))
const consumerRoot = join(temporaryRoot, 'consumer')
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

try {
  const archiveName = run(
    npmCommand,
    ['pack', '--silent', '--pack-destination', temporaryRoot],
    projectRoot
  )
    .trim()
    .split(/\r?\n/)
    .at(-1)

  assert.ok(archiveName?.endsWith('.tgz'), 'npm pack did not produce a tarball')

  await mkdir(consumerRoot)
  await writeFile(
    join(consumerRoot, 'package.json'),
    JSON.stringify({ name: 'neo-date-package-smoke', private: true })
  )
  run(
    npmCommand,
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      join(temporaryRoot, archiveName),
    ],
    consumerRoot
  )

  const installedPackage = join(
    consumerRoot,
    'node_modules',
    '@lpm.dev',
    'neo.date'
  )
  await access(join(installedPackage, 'dist', 'index.js'))
  await access(join(installedPackage, 'dist', 'index.cjs'))
  await access(join(installedPackage, '.lpm', 'skills', 'getting-started.md'))
  await assert.rejects(access(join(installedPackage, '.lpm', 'audit-cache.json')))

  run(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      `
        import { format } from '@lpm.dev/neo.date'
        const value = format(new Date('2025-01-15T00:00:00.000Z'), {
          dateStyle: 'medium',
          timeZone: 'UTC',
        })
        if (value.includes('2025') === false) throw new Error(value)
      `,
    ],
    consumerRoot
  )
  run(
    process.execPath,
    [
      '--eval',
      `
        const { formatRelative } = require('@lpm.dev/neo.date')
        const base = new Date('2025-01-15T00:00:00.000Z')
        const value = formatRelative(new Date(base.getTime() + 3_600_000), base)
        if (value !== 'in 1 hour') throw new Error(value)
      `,
    ],
    consumerRoot
  )

  console.log('Packed ESM and CJS consumers passed')
} finally {
  await rm(temporaryRoot, { recursive: true, force: true })
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: process.env,
  })

  if (result.status !== 0) {
    throw new Error(
      [
        `${command} ${args.join(' ')} failed with exit code ${result.status}`,
        result.stdout,
        result.stderr,
      ]
        .filter(Boolean)
        .join('\n')
    )
  }

  return result.stdout
}
