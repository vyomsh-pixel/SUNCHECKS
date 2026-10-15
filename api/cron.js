import {
  handleCors,
  getReminders,
  updateReminder,
  addEmailLog,
  getProfile,
  computeNextTrigger,
  dispatchCyberEmail,
} from './_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res, 'GET, POST, OPTIONS')) return;

  const now = new Date();
  const [reminders, profile] = await Promise.all([getReminders(), getProfile()]);
  const isSimulated = !process.env.RESEND_API_KEY;

  let dispatchedCount = 0;
  const executionLogs = [];

  for (const rem of reminders) {
    if (rem.status !== 'active' || !rem.autoEmail) continue;

    const nextTrigger = rem.nextTriggerAt ? new Date(rem.nextTriggerAt) : null;
    if (nextTrigger && now.getTime() >= nextTrigger.getTime()) {
      const targetEmail = rem.email || profile.email || process.env.OPERATOR_EMAIL || '';

      try {
        const result = await dispatchCyberEmail({
          to: targetEmail,
          subject: `[CyberPulse] ${rem.title}`,
          badge: 'CYBERPULSE // SCHEDULED DIRECTIVE',
          title: rem.title,
          description: rem.description || 'Scheduled reminder execution.',
          footer: `CADENCE: ${(rem.cadence || 'daily').toUpperCase()} • TIMESTAMP: ${now.toISOString()}`,
        });

        await addEmailLog({
          reminderId: rem.id,
          title: rem.title,
          recipient: targetEmail || 'local-operator',
          provider: result.provider,
          status: result.ok
            ? result.simulated
              ? 'simulated'
              : 'dispatched'
            : `failed: ${result.error}`,
        });

        // Only advance nextTriggerAt when email dispatch succeeds (or in local simulated mode when RESEND_API_KEY is not set)
        if (result.ok) {
          const nextTime = computeNextTrigger(rem, true);
          await updateReminder(rem.id, { nextTriggerAt: nextTime });
          dispatchedCount++;
          executionLogs.push({
            id: rem.id,
            status: result.simulated ? 'simulated' : 'dispatched',
            messageId: result.id,
          });
        } else {
          executionLogs.push({
            id: rem.id,
            status: 'failed',
            error: result.error,
          });
        }
      } catch (err) {
        console.error(`Cron trigger error for ${rem.id}:`, err);
        executionLogs.push({ id: rem.id, status: 'error', error: err.message });
      }
    }
  }

  return res.status(200).json({
    success: true,
    simulated: isSimulated,
    checkedAt: now.toISOString(),
    dispatchedCount,
    remindersChecked: reminders.length,
    activeReminders: reminders.filter((r) => r.status === 'active').length,
    executionLogs,
  });
}
