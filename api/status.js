import { handleCors, getDbPool, getReminders } from './_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res, 'GET, OPTIONS')) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pool = getDbPool();
  const reminders = await getReminders();
  const activeCount = reminders.filter((r) => r.status === 'active').length;

  return res.status(200).json({
    online: true,
    engine: 'vercel_serverless',
    database: pool ? 'postgresql_neon' : 'in_memory_fallback',
    uptimeSeconds: Math.floor(process.uptime()),
    activeCount,
    totalReminders: reminders.length,
    serverTime: new Date().toISOString(),
  });
}
