import {
  handleCors,
  exportAllOperatorData,
  deleteAllOperatorData,
} from './_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res, 'GET, DELETE, OPTIONS')) return;

  if (req.method === 'GET') {
    try {
      const exported = await exportAllOperatorData();
      return res.status(200).json(exported);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await deleteAllOperatorData();
      return res.status(200).json({ status: 'deleted' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
