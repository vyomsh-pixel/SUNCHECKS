// Secure Server-Side Gemini 2.5 Flash Handler
// The user's Gemini API key is kept strictly on the server and is NEVER sent to the browser.
// Strict zero-emoji policy enforced.

import { handleCors } from './lib/db.js';

function sanitizeInput(val, maxLen = 2000) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

export default async function handler(req, res) {
  if (handleCors(req, res, 'POST, OPTIONS')) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const title = sanitizeInput(body.title, 2000);
  const theme = sanitizeInput(body.theme, 200);
  const mode = sanitizeInput(body.mode, 64);
  const taskType = sanitizeInput(body.taskType, 64);
  const concept = sanitizeInput(body.concept, 2000);

  if (!title && !concept) {
    return res.status(400).json({ error: 'Input title or concept is required (max 2000 chars).' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API Key not configured on server.' });
  }

  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let promptText = '';

  if (taskType === 'refine_idea') {
    promptText = `
You are the CyberPulse Blueprint Architect.
Blueprint Concept: "${concept || title}"
Category: "${theme || 'side_project'}"

Generate a structured technical breakdown.
ABSOLUTE RULE: DO NOT USE ANY EMOJIS (no faces, no rockets, no icons, no symbols). Only pure text.
Return strictly valid JSON with these keys:
- "techStack": Array of 3-5 technical stack strings (e.g. ["Next.js 15", "PostgreSQL", "TailwindCSS", "Prisma"]).
- "roadmap": Array of 3 sequential milestone phase strings.
- "valueProposition": A 1-sentence punchy summary of why this project is valuable.
`;
  } else {
    // Default: enhance reminder
    const modeInstruction =
      mode === 'serious'
        ? 'Tone: Sharp corporate cyberpunk terminal. Technical terminology, minimalist, ruthlessly practical.'
        : 'Tone: Witty, sarcastic, relatable tech/student banter. Grounded, funny, rib the user for procrastinating or over-caffeinating.';

    promptText = `
You are the CyberPulse Operational Terminal Assistant.
User Role: Student + Intern + Freelancer.
Task Title: "${title || 'Operational Sprint'}"
Category: "${(theme || 'work').toUpperCase()}"
Mode: ${(mode || 'serious').toUpperCase()}

Instructions:
1. ${modeInstruction}
2. ABSOLUTE CONSTRAINT: DO NOT USE ANY EMOJIS WHATSOEVER. No yellow faces, no rockets, no dice, NO unicode emojis.
3. Respond STRICTLY in valid JSON with these keys:
   - "formattedSummary": Concise 1-2 sentence description or witty phrase.
   - "actionableSteps": Array of 2 to 3 practical micro-steps (strings).
   - "phrasingTone": A 2-word label for the tone (e.g. "TACTICAL_HUD" or "SARCASTIC_DEV").
4. Return ONLY valid JSON.
`;
  }

  try {
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: mode === 'fun' ? 0.85 : 0.4,
        },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}));
      return res.status(500).json({ error: errData?.error?.message || 'Gemini API call failed' });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text || '{}');

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
