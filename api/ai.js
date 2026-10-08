// Secure Server-Side Gemini 3.8 Flash Handler
// The user's paid Gemini API key is kept strictly on the server and is NEVER sent to the browser.
// Strict zero-emoji policy enforced.

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

  const { title, theme, mode, taskType, concept } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API Key not configured on server.' });
  }

  const model = 'gemini-3.8-flash';
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
