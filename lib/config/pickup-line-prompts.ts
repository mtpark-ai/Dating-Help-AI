import { getExpertPickupLinePrompt, getTonePrompt } from './prompt-loader';

/**
 * Get the expert pickup line system prompt (loaded dynamically for better webpack performance)
 */
export async function getExpertPickupLineSystemPrompt(): Promise<string> {
  return getExpertPickupLinePrompt();
}

/**
 * Get tone-specific guidelines (loaded dynamically for better webpack performance)
 */
export async function getToneSpecificGuidelines(tone: 'Flirty' | 'Funny' | 'Casual'): Promise<string> {
  const toneMap = {
    'Flirty': 'flirty',
    'Funny': 'funny', 
    'Casual': 'casual'
  } as const;
  
  return getTonePrompt(toneMap[tone]);
}

export { getResponseQualityChecklist as RESPONSE_QUALITY_CHECKLIST } from './prompt-loader';

export type PickupLineTone = 'Flirty' | 'Funny' | 'Casual';