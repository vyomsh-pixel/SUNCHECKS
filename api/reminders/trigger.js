import { getReminders, addEmailLog } from '../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id, email } = req.body || {};
    if (!id) {
      return res.status(400).json({ success: false, error: 'Reminder ID is required' });
    }

    const reminders = await getReminders();
    const rem = reminders.find((r) => r.id === id) || {
      id,
      title: 'Scheduled Directive',
      theme: 'work',
      cadence: 'daily',
      time: '10:00',
      description: 'Instant reminder execution requested.',
      email: email || 'rajkesir74@gmail.com',
    };

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return res.status(500).json({ success: false, error: 'RESEND_API_KEY not configured on server' });
    }

    const targetEmail = email || rem.email || 'rajkesir74@gmail.com';
    const fromAddress = process.env.EMAIL_FROM || 'CyberPulse <onboarding@resend.dev>';

    const emailPayload = {
      from: fromAddress,
      to: targetEmail,
      subject: `[CyberPulse Instant] ${rem.title}`,
      html: `
        <div style="background-color: #07070A; color: #FFFFFF; font-family: monospace; padding: 24px; border: 1px solid #00F0FF;">
          <h2 style="color: #FCEE0A; margin: 0 0 8px 0;">CYBERPULSE // INSTANT DIRECTIVE</h2>
          <h3 style="color: #00F0FF; margin: 0 0 16px 0;">${rem.title}</h3>
          <p style="color: #CCCCCC; font-size: 14px; line-height: 1.5;">${rem.description || 'Directive execution requested.'}</p>
          <div style="margin-top: 20px; padding: 12px; background-color: #0F121D; border-left: 3px solid #00FF66; font-size: 12px; color: #888888;">
            CADENCE: ${(rem.cadence || 'DAILY').toUpperCase()} &bull; TIMESTAMP: ${new Date().toISOString()}
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
      status: emailRes.ok ? 'dispatched' : `failed: ${emailData?.error?.message || emailRes.statusText}`,
    });

    if (!emailRes.ok) {
      return res.status(400).json({
        success: false,
        error: emailData?.error?.message || 'Email delivery failed via Resend relay',
        data: emailData,
      });
    }

    return res.status(200).json({
      success: true,
      messageId: emailData?.id,
      recipient: targetEmail,
      title: rem.title,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
