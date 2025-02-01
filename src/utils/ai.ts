import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export const getAIResponse = async (messages: { role: string; content: string; }[]) => {
  try {
    const startThinking = Date.now();
    const response = await groq.chat.completions.create({
      messages,
      model: "deepseek-r1-distill-llama-70b",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '';
    const thinkingMatch = content.match(/<think>(.*?)<\/think>/s);
    
    return {
      content: content.replace(/<think>.*?<\/think>/s, '').trim(),
      thinking: thinkingMatch ? thinkingMatch[1].trim() : '',
      thinkingTime: Date.now() - startThinking
    };
  } catch (error) {
    console.error('AI API Error:', error);
    throw new Error('Failed to get AI response');
  }
};