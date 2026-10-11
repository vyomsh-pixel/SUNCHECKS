import test from 'node:test';
import assert from 'node:assert/strict';

import {
  escapeHtml,
  createOperatorToken,
  verifyOperatorAuth,
  computeNextTrigger,
  createReminder,
  updateReminder,
  getReminders,
  addEmailLog,
  saveProfile,
  exportAllOperatorData,
  deleteAllOperatorData,
  dispatchCyberEmail,
} from './lib/db.js';
import authHandler from './auth.js';
import profileHandler from './profile.js';
import accountHandler from './account.js';

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    ended: false,
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      this.ended = true;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

test('escapeHtml escapes &, <, >, ", and \'', async () => {
  const malicious = `<script>alert("XSS" & 'pwned')</script>`;
  const escaped = escapeHtml(malicious);
  assert.equal(
    escaped,
    '&lt;script&gt;alert(&quot;XSS&quot; &amp; &#39;pwned&#39;)&lt;/script&gt;'
  );

  const emailRes = await dispatchCyberEmail({
    to: '',
    title: '<img src=x onerror=alert(1)>',
    description: 'Run "deploy" & \'verify\' <now>',
  });
  assert.ok(!emailRes.html.includes('<img src=x'));
  assert.ok(emailRes.html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(emailRes.html.includes('Run &quot;deploy&quot; &amp; &#39;verify&#39; &lt;now&gt;'));
});

test('createOperatorToken and verifyOperatorAuth validate HMAC-SHA256 tokens', () => {
  const token = createOperatorToken();
  assert.ok(typeof token === 'string' && token.startsWith('cp_op_'));

  // Valid via Bearer header, X-Operator-Token header, or direct string
  assert.equal(verifyOperatorAuth({ headers: { authorization: `Bearer ${token}` } }), true);
  assert.equal(verifyOperatorAuth({ headers: { 'x-operator-token': token } }), true);
  assert.equal(verifyOperatorAuth(token), true);

  // Tampered or missing tokens fail
  assert.equal(verifyOperatorAuth({ headers: {} }), false);
  assert.equal(verifyOperatorAuth(null), false);
  assert.equal(verifyOperatorAuth(`${token}tampered`), false);
  assert.equal(verifyOperatorAuth('cp_op_operator_12345.deadbeef'), false);
});

test('auth endpoint returns authenticated status, operator role, and HMAC token', async () => {
  const badRes = createMockRes();
  await authHandler({ method: 'POST', headers: {}, body: { passcode: 'wrong' } }, badRes);
  assert.equal(badRes.statusCode, 401);

  const okRes = createMockRes();
  await authHandler({ method: 'POST', headers: {}, body: { passcode: '2077' } }, okRes);
  assert.equal(okRes.statusCode, 200);
  assert.equal(okRes.body.status, 'authenticated');
  assert.equal(okRes.body.role, 'operator');
  assert.equal(verifyOperatorAuth(okRes.body.token), true);
});

test('computeNextTrigger schedules 10:00 IST at 04:30 UTC regardless of server timezone', () => {
  const refNow = new Date('2026-05-10T01:00:00.000Z'); // 06:30 IST
  const nextIso = computeNextTrigger({ cadence: 'daily', time: '10:00', now: refNow }, false);
  assert.equal(nextIso, '2026-05-10T04:30:00.000Z');

  const nextTomorrowIso = computeNextTrigger({ cadence: 'daily', time: '10:00', now: refNow }, true);
  assert.equal(nextTomorrowIso, '2026-05-11T04:30:00.000Z');

  // Also test 3-arg legacy signature computeNextTrigger(cadence, rem, forceTomorrow)
  const legacyIso = computeNextTrigger('daily', { time: '10:00', now: refNow }, false);
  assert.equal(legacyIso, '2026-05-10T04:30:00.000Z');
  const parsed = new Date(legacyIso);
  assert.equal(parsed.getUTCHours(), 4);
  assert.equal(parsed.getUTCMinutes(), 30);
});

test('updateReminder recomputes nextTriggerAt when schedule fields or status=active change', async () => {
  const created = await createReminder({
    title: 'Morning Standup',
    cadence: 'daily',
    time: '10:00',
    status: 'paused',
  });

  assert.ok(created.nextTriggerAt.endsWith('T04:30:00.000Z'));

  // Updating time from 10:00 IST to 15:45 IST (10:15 UTC) should recompute nextTriggerAt
  const updatedTime = await updateReminder(created.id, { time: '15:45' });
  assert.ok(updatedTime);
  assert.ok(
    updatedTime.nextTriggerAt.endsWith('T10:15:00.000Z'),
    `Expected 15:45 IST (10:15 UTC), got ${updatedTime.nextTriggerAt}`
  );

  // Updating status to 'active' with a new time should also recompute
  const reactivated = await updateReminder(created.id, { time: '10:00', status: 'active' });
  assert.ok(reactivated.nextTriggerAt.endsWith('T04:30:00.000Z'));
});

test('exportAllOperatorData and deleteAllOperatorData manage operator data rights across /api/profile and /api/account', async () => {
  await saveProfile({ name: 'TestOp', email: 'op@example.com' });
  await createReminder({ title: 'Exportable Directive', time: '10:00', cadence: 'daily' });
  await addEmailLog({ title: 'Test Dispatch', recipient: 'op@example.com', status: 'simulated' });

  const exported = await exportAllOperatorData();
  assert.equal(exported.profile.name, 'TestOp');
  assert.ok(Array.isArray(exported.reminders) && exported.reminders.length >= 1);
  assert.ok(Array.isArray(exported.emailLogs) && exported.emailLogs.length >= 1);
  assert.ok(typeof exported.exportedAt === 'string');

  // Verify GET /api/profile?export=1
  const profExportRes = createMockRes();
  await profileHandler({ method: 'GET', query: { export: '1' }, headers: {} }, profExportRes);
  assert.equal(profExportRes.statusCode, 200);
  assert.ok(profExportRes.body.exportedAt);

  // Verify DELETE /api/account clears everything
  const delRes = createMockRes();
  await accountHandler({ method: 'DELETE', headers: {} }, delRes);
  assert.equal(delRes.statusCode, 200);
  assert.equal(delRes.body.status, 'deleted');

  const afterDelete = await exportAllOperatorData();
  assert.equal(afterDelete.reminders.length, 0);
  assert.equal(afterDelete.emailLogs.length, 0);
  assert.equal(afterDelete.profile.email, process.env.OPERATOR_EMAIL || '');

  // Verify deleteAllOperatorData directly
  const directDel = await deleteAllOperatorData();
  assert.equal(directDel.status, 'deleted');
  const remaining = await getReminders();
  assert.equal(remaining.length, 0);
});
