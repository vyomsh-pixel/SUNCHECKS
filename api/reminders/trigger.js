import { handleCors, getReminders, addEmailLog, dispatchCyberEmail } from '../lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res, 'POST, OPTIONS')) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id, email } = req.body || {};
    if (!id) {
      return res.status(400).json({ success: false, error: 'Reminder ID is required' });
    }

    const reminders = await getReminders();
    const defaultEmail = process.env.OPERATOR_EMAIL || '';
    const rem = reminders.find((r) => r.id === id) || {
      id,
      title: 'Scheduled Directive',
      theme: 'work',
      cadence: 'daily',
      time: '10:00',
      description: 'Instant reminder execution requested.',
      email: email || defaultEmail,
    };

    const targetEmail = email || rem.email || defaultEmail;

    const result = await dispatchCyberEmail({
      to: targetEmail,
      subject: `[CyberPulse Instant] ${rem.title}`,
      badge: 'CYBERPULSE // INSTANT DIRECTIVE',
      title: rem.title,
      description: rem.description || 'Directive execution requested.',
      footer: `CADENCE: ${(rem.cadence || 'DAILY').toUpperCase()} • TIMESTAMP: ${new Date().toISOString()}`,
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

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Email delivery failed via Resend relay',
        data: result.data,
      });
    }

    return res.status(200).json({
      success: true,
      simulated: result.simulated,
      messageId: result.id,
      recipient: targetEmail || 'local-operator',
      title: rem.title,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
