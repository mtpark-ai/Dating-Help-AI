import { getTonePrompt } from './prompt-loader';

/**
 * Get the relationship coach system prompt (loads casual tone prompt)
 */
export async function getRelationshipCoachSystemPrompt(): Promise<string> {
  return getTonePrompt('casual');
}

/**
 * Get flirty system prompt
 */
export async function getFlirtySystemPrompt(): Promise<string> {
  return getTonePrompt('flirty');
}

/**
 * Get funny system prompt
 */
export async function getFunnySystemPrompt(): Promise<string> {
  return getTonePrompt('funny');
}

/**
 * Get casual system prompt
 */
export async function getCasualSystemPrompt(): Promise<string> {
  return getTonePrompt('casual');
}

/**
 * Get style prompts based on tone (loaded dynamically for better webpack performance)
 */
export async function getStylePrompts(): Promise<Record<string, string>> {
  const [flirty, funny, casual] = await Promise.all([
    getTonePrompt('flirty'),
    getTonePrompt('funny'),
    getTonePrompt('casual')
  ]);

  return {
    flirty,
    funny,
    casual
  };
}

export type ConversationTone = 'flirty' | 'funny' | 'casual';