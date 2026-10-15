import { handleCors, getReminders, createReminder } from '../_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res, 'GET, POST, OPTIONS')) return;

  if (req.method === 'GET') {
    try {
      const reminders = await getReminders();
      return res.status(200).json(reminders);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = req.body || {};
      if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }
      const created = await createReminder(data);
      return res.status(201).json(created);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
