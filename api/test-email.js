import { addEmailLog } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};
  const targetEmail = email || 'rajkesir74@gmail.com';
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || 'CyberPulse <onboarding@resend.dev>';

  if (!resendApiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured on server' });
  }

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
        subject: '[CyberPulse] Neural Link Established',
        html: `
          <div style="background-color: #07070A; color: #FFFFFF; font-family: monospace; padding: 24px; border: 1px solid #00F0FF;">
            <h2 style="color: #FCEE0A; margin: 0 0 8px 0;">CYBERPULSE // OPERATIONAL VERIFICATION</h2>
            <h3 style="color: #00F0FF; margin: 0 0 16px 0;">NEURAL LINK ONLINE</h3>
            <p style="color: #CCCCCC; font-size: 14px; line-height: 1.5;">Your CyberPulse autonomous engine on Vercel is connected and ready to auto-dispatch reminders.</p>
            <div style="margin-top: 20px; padding: 12px; background-color: #0F121D; border-left: 3px solid #00FF66; font-size: 12px; color: #888888;">
              STATUS: OPERATIONAL 24/7 &bull; TIMESTAMP: ${new Date().toISOString()}
            </div>
          </div>
        `,
      }),
    });

    const data = await emailRes.json().catch(() => ({}));

    await addEmailLog({
      reminderId: 'test_verification',
      title: 'Neural Link Verification',
      recipient: targetEmail,
      provider: 'RESEND',
      status: emailRes.ok ? 'dispatched' : 'failed',
    });

    return res.status(200).json({ success: emailRes.ok, result: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
