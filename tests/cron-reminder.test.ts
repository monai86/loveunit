import assert from 'node:assert/strict';

async function runCronReminderTests() {
  console.log('Running scheduled donor reminder tests...');

  const { isAuthorizedCronRequest } = await import('../lib/cron');
  const originalSecret = process.env.CRON_SECRET;
  process.env.CRON_SECRET = 'test-cron-secret';

  assert.equal(
    isAuthorizedCronRequest(new Request('https://loveunit.test/api/cron/donor-preparation-reminder', {
      headers: { authorization: 'Bearer test-cron-secret' },
    })),
    true,
  );
  assert.equal(
    isAuthorizedCronRequest(new Request('https://loveunit.test/api/cron/donor-preparation-reminder')),
    false,
    'the reminder route must reject invocations without the configured cron secret',
  );

  if (originalSecret === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = originalSecret;
  console.log('Scheduled reminder accepts only the Vercel cron secret.\n');
}

runCronReminderTests().catch((error) => {
  console.error('Scheduled donor reminder tests failed:', error);
  process.exit(1);
});
