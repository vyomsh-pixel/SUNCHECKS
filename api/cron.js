import { getReminders, updateReminder, addEmailLog, getProfile, computeNextTrigger } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Can be called by Vercel Cron, client background heartbeat, or manual trigger
  const now = new Date();
  const reminders = await getReminders();
  const profile = await getProfile();
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || 'CyberPulse <onboarding@resend.dev>';

  if (!resendApiKey) {
    return res.status(200).json({
      success: false,
      warning: 'RESEND_API_KEY not configured on server',
      checkedAt: now.toISOString(),
      dispatchedCount: 0,
      activeReminders: reminders.filter((r) => r.status === 'active').length,
    });
  }

  let dispatchedCount = 0;
  const executionLogs = [];

  for (const rem of reminders) {
    if (rem.status !== 'active' || !rem.autoEmail) continue;

    const nextTrigger = rem.nextTriggerAt ? new Date(rem.nextTriggerAt) : null;
    if (nextTrigger && now.getTime() >= nextTrigger.getTime()) {
      // Time to fire!
      const targetEmail = rem.email || profile.email;

      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromAddress,
            to: targetEmail,
            subject: `[CyberPulse] ${rem.title}`,
            html: `
              <div style="background-color: #07070A; color: #FFFFFF; font-family: monospace; padding: 24px; border: 1px solid #00F0FF;">
                <h2 style="color: #FCEE0A; margin: 0 0 8px 0;">CYBERPULSE // SCHEDULED DIRECTIVE</h2>
                <h3 style="color: #00F0FF; margin: 0 0 16px 0;">${rem.title}</h3>
                <p style="color: #CCCCCC; font-size: 14px; line-height: 1.5;">${rem.description || 'Scheduled reminder execution.'}</p>
                <div style="margin-top: 20px; padding: 12px; background-color: #0F121D; border-left: 3px solid #00FF66; font-size: 12px; color: #888888;">
                  CADENCE: ${rem.cadence.toUpperCase()} &bull; TIMESTAMP: ${now.toISOString()}
                </div>
              </div>
            `,
          }),
        });

        const emailData = await emailRes.json().catch(() => ({}));

        await addEmailLog({
          reminderId: rem.id,
          title: rem.title,
          recipient: targetEmail,
          provider: 'RESEND',
          status: emailRes.ok ? 'dispatched' : `failed: ${emailData?.error?.message || emailRes.statusText}`,
        });

        // Compute next trigger accurately
        const nextTime = computeNextTrigger(rem.cadence, rem, true);
        await updateReminder(rem.id, { nextTriggerAt: nextTime });

        if (emailRes.ok) {
          dispatchedCount++;
          executionLogs.push({ id: rem.id, status: 'dispatched', messageId: emailData?.id });
        } else {
          executionLogs.push({ id: rem.id, status: 'failed', error: emailData?.error?.message });
        }
      } catch (err) {
        console.error(`Cron trigger error for ${rem.id}:`, err);
        executionLogs.push({ id: rem.id, status: 'error', error: err.message });
      }
    }
  }

  return res.status(200).json({
    success: true,
    checkedAt: now.toISOString(),
    dispatchedCount,
    remindersChecked: reminders.length,
    executionLogs,
  });
}
