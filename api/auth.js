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

  const { passcode } = req.body || {};
  const validPasscode = process.env.OPERATOR_PASSCODE || '2077';

  if (!passcode || passcode.trim() !== validPasscode.trim()) {
    return res.status(401).json({
      success: false,
      error: 'ACCESS DENIED // INVALID CLEARANCE PASSCODE',
    });
  }

  // Generate lightweight session token
  const token = `cp_auth_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return res.status(200).json({
    success: true,
    token,
    operator: 'AUTHORIZED',
    message: 'NEURAL LINK ESTABLISHED // CLEARANCE GRANTED',
  });
}
