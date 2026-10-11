import {
  handleCors,
  getProfile,
  saveProfile,
  exportAllOperatorData,
  deleteAllOperatorData,
} from './lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res, 'GET, PUT, DELETE, OPTIONS')) return;

  if (req.method === 'GET') {
    try {
      const exportParam =
        req.query?.export ||
        new URL(req.url || '/', 'http://localhost').searchParams.get('export');

      if (exportParam === '1' || exportParam === 'true') {
        const exported = await exportAllOperatorData();
        return res.status(200).json(exported);
      }

      const profile = await getProfile();
      return res.status(200).json(profile);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const data = req.body || {};
      const updated = await saveProfile(data);
      return res.status(200).json(updated);
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
