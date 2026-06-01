const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const backendRoot = path.resolve(__dirname, '..');

const envCandidates = [
  path.join(repoRoot, '.env'),
  path.join(repoRoot, '.env.local'),
  path.join(backendRoot, '.env'),
  path.join(backendRoot, '.env.local'),
];

const preservedKeys = new Set(Object.keys(process.env));

for (const envPath of envCandidates) {
  if (!fs.existsSync(envPath)) {
    continue;
  }

  const fileContents = fs.readFileSync(envPath, 'utf8');
  const lines = fileContents.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.length === 0 || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }

    if (key.length === 0 || preservedKeys.has(key)) {
      continue;
    }

    process.env[key] = value;
  }
}

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error('No command provided. Usage: node scripts/run-with-env.js <command> [...args]');
  process.exit(1);
}

const result = spawnSync(command, args, {
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(result.error.message);
}

process.exit(result.status ?? 1);
