import { handleCors, getEmailLogs } from './lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res, 'GET, OPTIONS')) return;

  if (req.method === 'GET') {
    try {
      const logs = await getEmailLogs();
      return res.status(200).json(logs);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
