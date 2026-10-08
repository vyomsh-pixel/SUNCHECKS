import { updateReminder, deleteReminder, getReminders, addEmailLog } from '../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Reminder ID is required' });
  }

  if (req.method === 'PUT') {
    try {
      const updated = await updateReminder(id, req.body || {});
      if (!updated) {
        return res.status(404).json({ error: 'Reminder not found' });
      }
      return res.status(200).json(updated);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const ok = await deleteReminder(id);
      return res.status(200).json({ success: ok });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Handle instant trigger: POST /api/reminders/:id/trigger-now
  if (req.method === 'POST') {
    try {
      const reminders = await getReminders();
      const rem = reminders.find((r) => r.id === id);
      if (!rem) {
        return res.status(404).json({ error: 'Reminder not found' });
      }

      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        return res.status(500).json({ error: 'RESEND_API_KEY not configured on server' });
      }
      const targetEmail = req.body?.email || rem.email;

      const emailPayload = {
        from: process.env.EMAIL_FROM || 'CyberPulse <onboarding@resend.dev>',
        to: targetEmail,
        subject: `[CyberPulse Instant] ${rem.title}`,
        html: `
          <div style="background-color: #07070A; color: #FFFFFF; font-family: monospace; padding: 24px; border: 1px solid #00F0FF;">
            <h2 style="color: #FCEE0A; margin: 0 0 8px 0;">CYBERPULSE // INSTANT DIRECTIVE</h2>
            <h3 style="color: #00F0FF; margin: 0 0 16px 0;">${rem.title}</h3>
            <p style="color: #CCCCCC; font-size: 14px; line-height: 1.5;">${rem.description || 'Directive execution requested.'}</p>
            <div style="margin-top: 20px; padding: 12px; background-color: #0F121D; border-left: 3px solid #FCEE0A; font-size: 12px; color: #888888;">
              CADENCE: ${rem.cadence.toUpperCase()} &bull; TIMESTAMP: ${new Date().toISOString()}
            </div>
          </div>
        `,
      };

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(emailPayload),
      });

      const emailData = await emailRes.json().catch(() => ({}));

      await addEmailLog({
        reminderId: rem.id,
        title: rem.title,
        recipient: targetEmail,
        provider: 'RESEND',
        status: emailRes.ok ? 'dispatched' : 'failed',
      });

      return res.status(200).json({ success: emailRes.ok, data: emailData });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
