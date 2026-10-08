// Strict Gemini 3.8 Flash Client for CyberPulse
// SECURE BACKEND PROXY: The user's paid Gemini API key is stored safely on the server.
// The browser NEVER touches or exposes the API key.
// STRICT ZERO EMOJIS ENFORCED.

export const GEMINI_MODEL = 'gemini-3.8-flash';

export interface SmartReminderEnhancement {
  formattedSummary: string;
  actionableSteps: string[];
  phrasingTone: string;
}

/**
 * Enhances a task or study reminder via secure serverless endpoint.
 * Zero yellow emojis, no rocket ships, no dice.
 */
export async function enhanceReminder(
  title: string,
  theme: 'work' | 'cert' | 'freelance' | 'life',
  mode: 'serious' | 'fun'
): Promise<SmartReminderEnhancement> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, theme, mode }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        formattedSummary: data.formattedSummary || title,
        actionableSteps: Array.isArray(data.actionableSteps) ? data.actionableSteps : ['Execute directive', 'Verify output'],
        phrasingTone: data.phrasingTone || (mode === 'serious' ? 'TACTICAL_HUD' : 'SARCASTIC_DEV'),
      };
    }
  } catch {
    // Offline or serverless fallback
  }

  // Resilient instant fallback without crashing
  return {
    formattedSummary: title,
    actionableSteps: ['Confirm deliverables', 'Execute directive sprint'],
    phrasingTone: mode === 'serious' ? 'TACTICAL_HUD' : 'SARCASTIC_DEV',
  };
}

/**
 * Refines a project idea or certification target via secure serverless endpoint.
 */
export async function refineIdea(
  concept: string,
  category: string
): Promise<{ headline: string; techStack: string[]; roadmap: string[]; valueProposition: string }> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskType: 'refine_idea', concept, theme: category }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        headline: data.headline || concept,
        techStack: Array.isArray(data.techStack) ? data.techStack : ['TypeScript', 'PostgreSQL', 'TailwindCSS'],
        roadmap: Array.isArray(data.roadmap) ? data.roadmap : ['Wire data schema', 'Build core workflow', 'Deploy to production'],
        valueProposition: data.valueProposition || 'High-leverage milestone for portfolio and practical competence.',
      };
    }
  } catch {
    // Fallback
  }

  return {
    headline: concept,
    techStack: ['TypeScript', 'PostgreSQL', 'TailwindCSS'],
    roadmap: ['Wire data schema', 'Build core workflow', 'Deploy to production'],
    valueProposition: 'High-leverage milestone for career growth and certification progress.',
  };
}
