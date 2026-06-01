const { spawnSync } = require('child_process');
const path = require('path');

const workingDir = path.resolve(__dirname, '..');
const targetUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

if (!targetUrl) {
  console.error('TEST_DATABASE_URL or DATABASE_URL must be set to run Prisma migrations for tests.');
  process.exit(1);
}

const result = spawnSync('npx', ['prisma', 'db', 'push', '--skip-generate'], {
  stdio: 'pipe',
  cwd: workingDir,
  env: { ...process.env, DATABASE_URL: targetUrl },
  shell: process.platform === 'win32',
});

if (result.stdout?.length) {
  process.stdout.write(result.stdout);
}

if (result.stderr?.length) {
  process.stderr.write(result.stderr);
}

if (result.error || result.status !== 0) {
  console.error(
    'Não foi possível sincronizar o banco de testes. Garanta que o Postgres esteja disponível na URL informada em TEST_DATABASE_URL.',
  );
  process.exit(result.status ?? 1);
}

process.exit(0);
