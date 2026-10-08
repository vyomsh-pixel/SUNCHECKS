// Strict Gemini 3.8 Flash Client for CyberPulse
// Zero Emojis Policy Enforced

export const DEFAULT_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
export const GEMINI_MODEL = 'gemini-3.8-flash';

export async function callGemini(payload: Record<string, unknown>, userKey?: string): Promise<string> {
  const key = (userKey || DEFAULT_API_KEY).trim();
  if (!key) {
    throw new Error('Gemini API Key missing. Please provide a key in settings or .env file.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `HTTP error ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response received from Gemini 3.8 Flash.');
  }
  return text;
}

export interface SmartReminderEnhancement {
  formattedSummary: string;
  actionableSteps: string[];
  phrasingTone: string;
}

/**
 * Enhances a task or study reminder.
 * Strict: NO yellow emojis, no rocket ships, no dice.
 */
export async function enhanceReminder(
  title: string,
  theme: 'work' | 'cert' | 'freelance' | 'life',
  mode: 'serious' | 'fun',
  apiKey?: string
): Promise<SmartReminderEnhancement> {
  const modeInstruction = mode === 'serious'
    ? 'Tone: Sharp corporate cyberpunk terminal. Use technical terminology (EXECUTION_VECTOR, DIRECTIVE, SYNC). Minimalist and ruthlessly practical.'
    : 'Tone: Witty, sarcastic, relatable tech/student banter. Rib the user for procrastinating or over-caffeinating (e.g. "Did you actually write unit tests or did you just pray to the prod gods?"). Keep it funny and grounded.';

  const prompt = `
You are the CyberPulse Operational Terminal Assistant.
The user is a multi-hyphenate Student + Intern + Freelancer.
Task Title: "${title}"
Category: "${theme.toUpperCase()}"
UI Mode: ${mode.toUpperCase()}

Instructions:
1. ${modeInstruction}
2. ABSOLUTE CONSTRAINT: DO NOT USE ANY EMOJIS. No yellow faces, no rockets, no dice, no thumbs-up, NO unicode emojis whatsoever. Only clean text, brackets like [DIRECTIVE], [MEME_LOG], [STATUS: PENDING], or alphanumeric characters.
3. Respond STRICTLY in valid JSON with these keys:
   - "formattedSummary": A concise 1-2 sentence description or witty phrase.
   - "actionableSteps": An array of 2 to 3 practical micro-steps (strings).
   - "phrasingTone": A 2-word label for the tone (e.g. "TACTICAL_HUD" or "SARCASTIC_DEV").
4. Return ONLY valid JSON without markdown fences.
`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: mode === 'fun' ? 0.9 : 0.4,
    },
  };

  const rawJson = await callGemini(payload, apiKey);
  try {
    const parsed = JSON.parse(rawJson);
    return {
      formattedSummary: parsed.formattedSummary || title,
      actionableSteps: Array.isArray(parsed.actionableSteps) ? parsed.actionableSteps : ['Execute directive', 'Verify output'],
      phrasingTone: parsed.phrasingTone || (mode === 'serious' ? 'TACTICAL_HUD' : 'SARCASTIC_DEV'),
    };
  } catch {
    return {
      formattedSummary: title,
      actionableSteps: ['Review deliverables', 'Confirm milestones'],
      phrasingTone: mode === 'serious' ? 'TACTICAL_HUD' : 'SARCASTIC_DEV',
    };
  }
}

/**
 * Refines a project idea or certification target.
 */
export async function refineIdea(
  rawIdea: string,
  category: string,
  apiKey?: string
): Promise<{ headline: string; techStack: string[]; roadmap: string[]; valueProposition: string }> {
  const prompt = `
Analyze this project/study idea for a student-intern-freelancer:
Idea: "${rawIdea}"
Focus Area: "${category}"

Rules:
1. STRICT ZERO EMOJIS. No emojis allowed anywhere in the output.
2. Provide a practical execution blueprint.
3. Return STRICT JSON with keys:
   - "headline": Short high-impact project title
   - "techStack": Array of 3-5 recommended tools/technologies
   - "roadmap": Array of 3 sequential milestones
   - "valueProposition": One sentence explaining the tangible career or portfolio payoff.
`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.6,
    },
  };

  const rawJson = await callGemini(payload, apiKey);
  try {
    return JSON.parse(rawJson);
  } catch {
    return {
      headline: rawIdea,
      techStack: ['TypeScript', 'Node.js', 'Vite'],
      roadmap: ['Prototype core loop', 'Wire background daemon', 'Deploy and verify'],
      valueProposition: 'High-leverage milestone for portfolio and practical competence.',
    };
  }
}
