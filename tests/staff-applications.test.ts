// Staff-application workflow tests exercise the in-memory backend so the
// approval lifecycle can run in CI without a PostgreSQL instance.
process.env.DATA_BACKEND = 'memory';
// @ts-expect-error NODE_ENV is typed read-only but tests need to force test mode
process.env.NODE_ENV = 'test';

import assert from 'node:assert';
import { getInMemoryAuditLogs, getInMemoryStaffProfiles } from '../lib/db/store';

const uniqueEmail = (label: string) => `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@student.mahidol.edu`;

async function runStaffApplicationTests() {
  console.log('📝 Running Staff Application Workflow Tests...\n');

  const {
    submitStaffApplication,
    getPublicStaffApplicationStatus,
    approveStaffApplication,
    rejectStaffApplication,
    expirePendingStaffApplications,
  } = await import('../services/staff-application-service');

  // Break caught: allowing a second pending request for the same email would
  // make approval ownership ambiguous.
  console.log('Test 1: public application creates one pending request per email');
  const pendingEmail = uniqueEmail('pending');
  const submitted = await submitStaffApplication({
    email: pendingEmail,
    displayName: 'somchai_test',
    team: 'หน่วยงานทดสอบ',
  });
  assert.strictEqual(submitted.success, true);
  assert.match(submitted.application.referenceCode, /^STF-[A-Z0-9]{10}$/);

  const pendingStatus = await getPublicStaffApplicationStatus(submitted.application.referenceCode);
  assert.strictEqual(pendingStatus?.status, 'PENDING');
  assert.strictEqual(pendingStatus?.referenceCode, submitted.application.referenceCode);

  const duplicate = await submitStaffApplication({
    email: pendingEmail.toUpperCase(),
    displayName: 'somchai_dup',
    team: 'หน่วยงานทดสอบ',
  });
  assert.deepStrictEqual(duplicate, { success: false, code: 'PENDING_APPLICATION_EXISTS' });
  console.log('✓ pending applications are unique by normalized email\n');

  // Break caught: Super Admin can directly approve with one click,
  // activating the staff account with default password loveunit2026.
  console.log('Test 2: super-admin one-click approval provisions a STAFF account with default loveunit2026 password');
  const approval = await approveStaffApplication({
    applicationId: submitted.application.id,
    actorId: 'u-super-admin-test',
  });
  assert.strictEqual(approval.success, true);
  assert.strictEqual(approval.user.email, pendingEmail);
  assert.strictEqual(approval.user.role, 'STAFF');
  assert.strictEqual(approval.user.isActive, true);
  assert.strictEqual(approval.user.mustChangePassword, false);

  const approvedStatus = await getPublicStaffApplicationStatus(submitted.application.referenceCode);
  assert.strictEqual(approvedStatus?.status, 'APPROVED');
  assert.ok((await getInMemoryStaffProfiles()).some((profile) => profile.email === pendingEmail && profile.role === 'STAFF'));
  assert.ok(getInMemoryAuditLogs().some((entry) => entry.action === 'APPROVE_STAFF_APPLICATION' && entry.entity_id === submitted.application.id));
  console.log('✓ one-click approval provisions an active Staff account with default password loveunit2026 and writes an audit event\n');

  // Break caught: a rejection without its supplied reason would prevent the
  // applicant and operators from understanding the decision.
  console.log('Test 3: rejection records its reason and remains visible by reference');
  const rejected = await submitStaffApplication({
    email: uniqueEmail('rejected'),
    displayName: 'ผู้สมัครรอปฏิเสธ',
    team: 'หน่วยงานทดสอบ',
  });
  assert.strictEqual(rejected.success, true);
  const rejection = await rejectStaffApplication({
    applicationId: rejected.application.id,
    actorId: 'u-super-admin-test',
    reason: 'ยังไม่มีตำแหน่งว่างในหน่วยงานนี้',
  });
  assert.strictEqual(rejection.success, true);
  const rejectedStatus = await getPublicStaffApplicationStatus(rejected.application.referenceCode);
  assert.strictEqual(rejectedStatus?.status, 'REJECTED');
  assert.strictEqual(rejectedStatus?.rejectionReason, 'ยังไม่มีตำแหน่งว่างในหน่วยงานนี้');
  assert.ok(getInMemoryAuditLogs().some((entry) => entry.action === 'REJECT_STAFF_APPLICATION' && entry.entity_id === rejected.application.id));
  console.log('✓ rejection keeps the decision reason and audit trail\n');

  // Break caught: stale pending requests becoming approvable indefinitely.
  console.log('Test 4: pending applications expire after their review window');
  const expiring = await submitStaffApplication({
    email: uniqueEmail('expired'),
    displayName: 'ผู้สมัครหมดอายุ',
    team: 'หน่วยงานทดสอบ',
  });
  assert.strictEqual(expiring.success, true);
  await expirePendingStaffApplications(new Date(Date.now() + 31 * 24 * 60 * 60 * 1000));
  const expiredStatus = await getPublicStaffApplicationStatus(expiring.application.referenceCode);
  assert.strictEqual(expiredStatus?.status, 'EXPIRED');
  console.log('✓ expired applications cannot remain pending indefinitely\n');

  console.log('🎉 ALL STAFF APPLICATION WORKFLOW TESTS PASSED!');
}

runStaffApplicationTests().catch((error) => {
  console.error('❌ Staff application workflow test failed:', error);
  process.exit(1);
});
