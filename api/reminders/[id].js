import { handleCors, updateReminder, deleteReminder } from '../lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res, 'PUT, DELETE, OPTIONS')) return;

  const { id } = req.query || {};
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

  return res.status(405).json({ error: 'Method not allowed' });
}
