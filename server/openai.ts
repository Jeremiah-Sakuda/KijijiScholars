// OpenAI AI Integrations blueprint - see blueprint:javascript_openai_ai_integrations
import OpenAI from "openai";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export async function getEssayFeedback(essayContent: string, prompt?: string): Promise<{
  tone?: string;
  clarity?: string;
  storytelling?: string;
  suggestions?: string[];
  overallScore?: number;
}> {
  try {
    const systemPrompt = `You are an expert college admissions essay reviewer. Provide constructive, actionable feedback to help students improve their essays. Focus on tone, clarity, and storytelling.`;
    
    const userPrompt = `
Essay Prompt: ${prompt || "Personal Statement"}

Essay Content:
${essayContent}

Please provide feedback in the following format:
1. Tone: Analyze the tone and whether it's appropriate for college admissions
2. Clarity: Evaluate how clearly the student communicates their ideas
3. Storytelling: Assess the narrative structure and engagement
4. Suggestions: Provide 3-5 specific, actionable suggestions for improvement
5. Overall Score: Rate the essay from 1-10

Format your response as JSON with keys: tone, clarity, storytelling, suggestions (array), overallScore (number).
`;

    // Using gpt-4o for reliable AI feedback generation
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content || "{}";
    console.log("[OpenAI] Raw response content:", content);
    const feedback = JSON.parse(content);
    console.log("[OpenAI] Parsed feedback:", JSON.stringify(feedback, null, 2));
    
    const result = {
      tone: feedback.tone || "Unable to analyze tone",
      clarity: feedback.clarity || "Unable to analyze clarity",
      storytelling: feedback.storytelling || "Unable to analyze storytelling",
      suggestions: feedback.suggestions || [],
      overallScore: feedback.overallScore || 5
    };
    
    console.log("[OpenAI] Returning result:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("Error getting AI feedback:", error);
    throw new Error("Failed to generate AI feedback");
  }
}
