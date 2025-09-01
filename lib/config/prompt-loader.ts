import { readFile } from 'fs/promises';
import { join } from 'path';

// Cache for loaded prompts to avoid repeated file reads
// Using Buffer-based caching to improve webpack serialization performance
const promptCache = new Map<string, Buffer>();

/**
 * Load prompt content from external files using Buffer optimization
 * This approach reduces webpack serialization overhead by avoiding large strings in JS bundles
 */
async function loadPrompt(filename: string): Promise<string> {
  if (promptCache.has(filename)) {
    // Convert cached Buffer back to string
    return promptCache.get(filename)!.toString('utf-8');
  }

  try {
    const promptPath = join(process.cwd(), 'lib/config/prompts', filename);
    const buffer = await readFile(promptPath);
    
    // Cache the raw buffer instead of string for better webpack performance
    promptCache.set(filename, buffer);
    return buffer.toString('utf-8');
  } catch (error) {
    console.error(`Failed to load prompt file: ${filename}`, error);
    throw new Error(`Prompt file not found: ${filename}`);
  }
}

/**
 * Dynamically load the expert pickup line system prompt
 */
export async function getExpertPickupLinePrompt(): Promise<string> {
  return loadPrompt('pickup-line-expert.txt');
}

/**
 * Dynamically load tone-specific prompts
 */
export async function getTonePrompt(tone: 'flirty' | 'funny' | 'casual'): Promise<string> {
  const filename = `${tone}-tone.txt`;
  return loadPrompt(filename);
}

/**
 * Load all tone prompts at once for batch operations
 */
export async function getAllTonePrompts(): Promise<Record<string, string>> {
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

/**
 * Clear prompt cache - useful for development/testing
 */
export function clearPromptCache(): void {
  promptCache.clear();
}

/**
 * Preload all prompts into cache - can be called during app initialization
 */
export async function preloadPrompts(): Promise<void> {
  await Promise.all([
    getExpertPickupLinePrompt(),
    getTonePrompt('flirty'),
    getTonePrompt('funny'),
    getTonePrompt('casual')
  ]);
}

/**
 * Lazy-loaded configuration using dynamic imports for better webpack performance
 * Note: Not currently used, but available for future optimization needs
 */
export async function loadConfigurationAsync<T>(module: string): Promise<T> {
  try {
    // Use dynamic import for better code splitting
    const config = await import(/* webpackIgnore: true */ module);
    return config.default || config;
  } catch (error) {
    console.error(`Failed to load configuration module: ${module}`, error);
    throw new Error(`Configuration module not found: ${module}`);
  }
}

/**
 * Load checklist dynamically to avoid webpack bundling overhead
 */
export async function getResponseQualityChecklist(): Promise<string[]> {
  const checklist = [
    "✅ 基于profile的具体观察?",
    "✅ 包含好奇心触发器?",
    "✅ 语言自然流畅?",
    "✅ 长度适中(15-25词)?",
    "✅ 容易回复?",
    "✅ 避免了cliché?",
    "✅ 符合选择的tone?",
    "✅ 有记忆点或独特性?"
  ];
  return checklist;
}