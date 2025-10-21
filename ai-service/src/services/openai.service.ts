import OpenAI from 'openai';
import { logger } from './logging.service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const aiService = {
  async analyzeSeafarerMatch(
    assignment: any,
    seafarer: any,
    context: any
  ): Promise<{ score: number; reasoning: string; strengths: string[]; risks: string[] }> {
    try {
      const prompt = `
You are an expert maritime crew planning AI. Analyze this seafarer-assignment match:

Assignment:
- Vessel: ${assignment.vessel_name} (${assignment.vessel_type || 'Unknown'})
- Rank Required: ${assignment.rank}
- Sign-on Date: ${assignment.sign_on_date}
- Contract Duration: ${assignment.contract_duration_months} months

Seafarer:
- Name: ${seafarer.full_name}
- Rank: ${seafarer.rank}
- Nationality: ${seafarer.nationality}
- Status: ${seafarer.status}
- Available From: ${seafarer.available_from || 'Immediately'}

Evaluate and return a JSON object with:
{
  "score": <0-100 match score>,
  "reasoning": "<brief 1-2 sentence explanation>",
  "strengths": ["strength1", "strength2", "strength3"],
  "risks": ["risk1", "risk2"] or []
}

Consider:
- Rank match (exact match is best)
- Availability timing
- Vessel type experience
- Nationality/language compatibility
- Current status (prefer on_shore over on_leave)
`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 500
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      logger.info(`AI Match Analysis: ${seafarer.full_name} -> ${assignment.vessel_name}: ${result.score}%`);
      
      return {
        score: result.score || 0,
        reasoning: result.reasoning || 'AI analysis completed',
        strengths: result.strengths || [],
        risks: result.risks || []
      };
    } catch (error) {
      logger.error('OpenAI API error:', error);
      // Fallback to basic scoring if AI fails
      const baseScore = assignment.rank === seafarer.rank ? 80 : 50;
      return {
        score: baseScore,
        reasoning: 'AI analysis unavailable, using fallback scoring',
        strengths: ['Rank match'] if assignment.rank === seafarer.rank else [],
        risks: ['AI analysis failed - manual review recommended']
      };
    }
  }
};



