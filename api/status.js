import { getDbPool, getReminders } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const pool = getDbPool();
  const reminders = await getReminders();
  const activeCount = reminders.filter((r) => r.status === 'active').length;

  res.status(200).json({
    online: true,
    engine: 'vercel_serverless',
    database: pool ? 'postgresql_neon' : 'in_memory_fallback',
    uptimeSeconds: Math.floor(process.uptime()),
    activeCount,
    totalReminders: reminders.length,
    serverTime: new Date().toISOString(),
  });
}
