import { handleCors, addEmailLog, dispatchCyberEmail } from './lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res, 'POST, OPTIONS')) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};
  const targetEmail = email || process.env.OPERATOR_EMAIL || '';

  if (!targetEmail && process.env.RESEND_API_KEY) {
    return res.status(400).json({ error: 'Recipient email is required' });
  }

  try {
    const result = await dispatchCyberEmail({
      to: targetEmail,
      subject: '[CyberPulse] Neural Link Established',
      badge: 'CYBERPULSE // OPERATIONAL VERIFICATION',
      title: 'NEURAL LINK ONLINE',
      description:
        'Your CyberPulse autonomous engine on Vercel is connected and ready to auto-dispatch reminders.',
      footer: `STATUS: OPERATIONAL 24/7 • TIMESTAMP: ${new Date().toISOString()}`,
    });

    await addEmailLog({
      reminderId: 'test_verification',
      title: 'Neural Link Verification',
      recipient: targetEmail || 'local-operator',
      provider: result.provider,
      status: result.ok ? (result.simulated ? 'simulated' : 'dispatched') : 'failed',
    });

    if (!result.ok) {
      return res.status(500).json({ success: false, error: result.error });
    }

    return res.status(200).json({
      success: true,
      simulated: result.simulated,
      result: result.data || { id: result.id },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
