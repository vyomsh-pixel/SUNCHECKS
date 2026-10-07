import { DailyLog, AiRoutine } from './types';

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export const HEALTH_DISCLAIMER =
  'DayPulse is a personal wellness visualization tool for self-tracking and reflection. It is not intended to diagnose, treat, or replace professional medical advice.';

export async function generateDailyRoutine(log: DailyLog, apiKey: string): Promise<AiRoutine> {
  if (!apiKey) {
    throw new Error('Please configure your Gemini API Key in Settings to generate AI routines.');
  }

  const moodLabels = ['', 'Rough', 'Down', 'Steady', 'Good', 'Radiant'];
  const prompt = `
You are the DayPulse Wellness Guide. Analyze today's check-in metrics and generate a calm, realistic, grounded daily rhythm.

User's Check-in Today:
- Mood: ${moodLabels[log.mood]} (${log.mood}/5)
- Energy Level: ${log.energy}/10
- Focus Intention: "${log.intention || 'Have a steady, productive day'}"
- Gratitude: "${log.gratitude || 'Being present'}"

Instructions:
1. Respond STRICTLY in valid JSON format with these exact keys:
   - "theme": A short 3-5 word calm theme for the day (e.g. "Gentle Momentum & Clear Focus")
   - "morningBlock": Practical morning guidance tailored to energy ${log.energy}/10
   - "afternoonBlock": Sustainable afternoon work/flow block
   - "eveningWindDown": Calming evening decompression ritual
   - "mindfulGrounding": One 2-minute actionable breathing or grounding exercise
2. Keep the tone warm, grounded, and concise. Never provide clinical or diagnostic advice.
3. Return ONLY the raw JSON object without markdown fences or extraneous text.
`;

  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `HTTP error ${response.status}`;
    throw new Error(`Gemini API Error: ${message}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No response returned from Gemini.');
  }

  try {
    const parsed = JSON.parse(text);
    return {
      theme: parsed.theme || 'Steady & Centered Rhythm',
      morningBlock: parsed.morningBlock || 'Start gently with a glass of water and 10 minutes of daylight.',
      afternoonBlock: parsed.afternoonBlock || 'Focus on your key intention during your peak energy window.',
      eveningWindDown: parsed.eveningWindDown || 'Disconnect from screens 30 minutes before sleep.',
      mindfulGrounding: parsed.mindfulGrounding || 'Take 4 slow belly breaths: inhale for 4, exhale for 6.',
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (e) {
    console.error('Failed to parse Gemini JSON output', text, e);
    throw new Error('Failed to parse structured routine format.');
  }
}

export async function askAdvisor(
  history: { sender: 'user' | 'assistant'; text: string }[],
  userMessage: string,
  currentLog: DailyLog,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('Please configure your Gemini API Key in Settings to speak with the Advisor.');
  }

  const systemPrompt = `
You are the DayPulse Wellness Advisor — a calm, warm, supportive, and practical companion.
Context about the user today:
- Today's Mood: ${currentLog.mood}/5
- Energy Battery: ${currentLog.energy}/10
- Intention: "${currentLog.intention || 'None set yet'}"

Guidelines:
- Keep answers concise, grounded, and compassionate (2-3 short paragraphs max).
- Offer micro-actions, cognitive reframing, or breathing techniques when stress is indicated.
- Strict boundary: You are a personal wellness visualizer and helper, NOT a healthcare professional. Never diagnose or prescribe medical treatments.
`;

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    ...history.slice(-6).map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `HTTP error ${response.status}`;
    throw new Error(`Gemini API Error: ${message}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Advisor could not generate a response.');
  }
  return text;
}
