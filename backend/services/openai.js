const axios = require("axios");
require("dotenv").config();

async function generateNaturalResponse(userQuestion, fact, userProfile = null) {
  const systemPrompt = buildSystemPrompt(userProfile);
  
  const messages = [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "user",
      content: `Q: ${userQuestion}\n\nFact: ${fact}`
    }
  ];

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages,
        temperature: 0.5,
        max_tokens: 400
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 8000 // 8 seconds
      }
    );

    let output = response.data.choices[0].message.content.trim();
    output = output.replace(/^here('|')s.*?:/i, '').trim();
    return output;

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return "[Sorry, the reply is taking too long. Please try again.]";
    }
    console.error("OpenAI API error:", error.message);
    return "[Sorry, I couldn't generate a response right now.]";
  }
}

function buildSystemPrompt(userProfile) {
  let prompt = `
You are a warm, supportive assistant for the Singapore Cancer Society.
Always answer in a friendly, concise, and factual way. Only use the information provided.
If the user is anxious, start with a short word of encouragement.

FORMATTING RULES:
- Use Markdown for formatting.
- Use paragraphs to break up long text. Use newline characters (\\n) for separation.
- Use bullet points (using * or -) for lists of recommendations or key points.
- Use bold text (**) to highlight important terms and action items.
- Keep sentences and paragraphs short and easy to read.
`;

  if (userProfile) {
    prompt += `

USER CONTEXT:
- Risk Level: ${userProfile.riskLevel || 'Unknown'}
- Knowledge Level: ${userProfile.knowledgeLevel || 'Unknown'}
- Key Risk Factors: ${userProfile.riskFactors ? userProfile.riskFactors.join(', ') : 'None identified'}
- Last Assessment: ${userProfile.lastQuizDate ? new Date(userProfile.lastQuizDate).toLocaleDateString() : 'Unknown'}

PERSONALIZATION RULES:
`;

    // Risk-based personalization
    if (userProfile.riskLevel === 'HIGH_RISK') {
      prompt += `- User has HIGH cancer risk: Emphasize urgency, specific actions, and immediate next steps
- Be more direct about the importance of screening and lifestyle changes
- Suggest consulting healthcare providers when appropriate
`;
    } else if (userProfile.riskLevel === 'MODERATE_RISK') {
      prompt += `- User has MODERATE cancer risk: Focus on prevention and gradual improvements
- Encourage continued healthy habits and regular monitoring
- Suggest specific lifestyle modifications
`;
    } else if (userProfile.riskLevel === 'LOW_RISK') {
      prompt += `- User has LOW cancer risk: Focus on maintenance and prevention
- Acknowledge their healthy choices and encourage continued good habits
- Emphasize the importance of staying up-to-date with screenings
`;
    }

    // Knowledge-level personalization
    if (userProfile.knowledgeLevel === 'Low' || userProfile.knowledgeLevel === 'Very Low') {
      prompt += `- User has limited cancer knowledge: Explain concepts thoroughly, use simpler language
- Avoid medical jargon, provide clear explanations
- Focus on basic concepts and actionable information
`;
    } else if (userProfile.knowledgeLevel === 'High') {
      prompt += `- User has good cancer knowledge: Can use more technical terms and advanced concepts
- Provide more detailed explanations when appropriate
- Reference specific studies or advanced prevention strategies
`;
    }

    // Factor-specific personalization
    if (userProfile.riskFactors) {
      prompt += `- Reference their specific risk factors when relevant to the question
- Provide targeted advice based on their identified risk factors
- Suggest personalized screening recommendations based on their profile
`;
    }

    prompt += `
- Always maintain a supportive and encouraging tone
- If mentioning their risk factors, do so sensitively and constructively
- Focus on actionable advice and positive next steps
`;
  }

  return prompt.trim();
}

module.exports = generateNaturalResponse;
