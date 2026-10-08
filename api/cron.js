import { getReminders, updateReminder, addEmailLog, getProfile } from './lib/db.js';

export default async function handler(req, res) {
  // Can be called by Vercel Cron or manual health check
  const now = new Date();
  const reminders = await getReminders();
  const profile = await getProfile();
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || 'CyberPulse <onboarding@resend.dev>';

  if (!resendApiKey) {
    return res.status(200).json({ warning: 'RESEND_API_KEY not configured on server' });
  }

  let dispatchedCount = 0;

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
                  CADENCE: ${rem.cadence.toUpperCase()} &bull; NEXT SYNC: 24H
                </div>
              </div>
            `,
          }),
        });

        await addEmailLog({
          reminderId: rem.id,
          title: rem.title,
          recipient: targetEmail,
          provider: 'RESEND',
          status: emailRes.ok ? 'dispatched' : 'failed',
        });

        // Compute next trigger (default: +24h for daily)
        const nextTime = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
        await updateReminder(rem.id, { nextTriggerAt: nextTime });
        dispatchedCount++;
      } catch (err) {
        console.error(`Cron trigger error for ${rem.id}:`, err);
      }
    }
  }

  return res.status(200).json({
    success: true,
    checkedAt: now.toISOString(),
    dispatchedCount,
  });
}
