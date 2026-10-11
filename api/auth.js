import { handleCors, createOperatorToken, verifyOperatorAuth } from './lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res, 'GET, POST, OPTIONS')) return;

  if (req.method === 'GET') {
    const authenticated = verifyOperatorAuth(req);
    return res.status(authenticated ? 200 : 401).json({
      status: authenticated ? 'authenticated' : 'unauthenticated',
      role: authenticated ? 'operator' : 'guest',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { passcode } = req.body || {};
  const validPasscode = process.env.OPERATOR_PASSCODE || '2077';

  if (!passcode || String(passcode).trim() !== String(validPasscode).trim()) {
    return res.status(401).json({
      status: 'unauthorized',
      success: false,
      error: 'ACCESS DENIED // INVALID CLEARANCE PASSCODE',
    });
  }

  const token = createOperatorToken();
  return res.status(200).json({
    status: 'authenticated',
    role: 'operator',
    token,
    success: true,
    operator: 'AUTHORIZED',
    message: 'NEURAL LINK ESTABLISHED // CLEARANCE GRANTED',
  });
}
