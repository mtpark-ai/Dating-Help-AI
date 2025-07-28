import { TONE_SPECIFIC_GUIDELINES } from './config/pickup-line-prompts'
import type { GeneratePickupLinesRequest, GeneratePickupLinesResponse } from '@/types'

const toneTemperatureMap: Record<string, number> = {
  flirty: 0.7,
  funny: 0.65,
  casual: 0.6,
}
function getTemperatureByTone(tone?: string) {
  if (!tone) return 0.7;
  return toneTemperatureMap[tone] ?? 0.7;
}

export async function generatePickupLines(body: GeneratePickupLinesRequest): Promise<GeneratePickupLinesResponse> {
  const apiKey = process.env.OPENAI_API_KEY || ""
  const baseURL = process.env.OPENAI_BASE_URL || ""

  const { analysis: { summary, insights }, tone, matchName, otherInfo } = body
  const toneGuidelines = TONE_SPECIFIC_GUIDELINES[tone as keyof typeof TONE_SPECIFIC_GUIDELINES] || TONE_SPECIFIC_GUIDELINES.Casual

  // Build high-quality structured prompt
  const expertPrompt = `You are a world-class dating app expert specializing in creating personalized pickup lines based on detailed profile analysis.

# Mission Objective
Based on the detailed profile analysis below, generate 3 high-response-rate pickup lines in ${tone} style.

# Profile Analysis Data
## Personality Summary
${summary}

## Specific Observation Insights (Key Reference Points)
${insights.map((insight, index) => `${index + 1}. ${insight}`).join('\n')}

${matchName ? `## Match Information\nName: ${matchName}` : ''}
${otherInfo ? `Additional Background: ${otherInfo}` : ''}

# ${tone} Style Guidelines
${toneGuidelines}

# Generation Strategy
## Must Accomplish:
1. **Specific Observations**: Each line must reference specific details from the insights above
2. **Formula Application**: [Personalized Observation] + [Curiosity-Inducing Question/Comment]
3. **Optimal Length**: 15-25 English words
4. **Conversation-Friendly**: Design open-ended questions that are easy to respond to
5. **Style Consistency**: Strictly follow ${tone} style characteristics

## Quality Checklist:
- Is it based on specific profile details?
- Does it avoid generic compliments?
- Does it create desire to respond?
- Does it match ${tone} style requirements?

# Output Requirements
Output 3 pickup lines, one per line, no numbering needed. Each should make the person think: "Wow, this person really looked at my profile carefully!"

Generate pickup lines based on the above analysis:`

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a world-class dating app expert and psychologist. Your specialty is analyzing dating profiles and creating highly personalized, effective first messages that get responses. You excel at finding unique details and turning them into conversation starters."
        },
        {
          role: "user",
          content: expertPrompt
        }
      ],
      temperature: getTemperatureByTone(tone),
      max_tokens: 150
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('OpenAI API error:', errorText)
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content || ""
  
  // Parse the response into individual pickup lines
  const pickupLines = content
    .split('\n')
    .filter((line: string) => line.trim())
    .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
    .filter((line: string) => line.length > 0)
    .slice(0, 3) // Ensure we only get 3 lines

  // If we don't have 3 lines, provide fallbacks
  while (pickupLines.length < 3) {
    pickupLines.push("I noticed something interesting in your profile - what's the story behind it?")
  }

  return { lines: pickupLines }
}