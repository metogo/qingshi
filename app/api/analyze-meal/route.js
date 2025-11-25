import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Create an OpenAI API client (that's edge friendly!)
const openai = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});
alert(openai)
// 使用默认Node.js runtime（环境变量更稳定）
// export const runtime = 'edge';

export async function POST(req) {
  const { messages } = await req.json();

  // Ask OpenAI for a streaming chat completion given the prompt
  const result = streamText({
    model: openai('google/gemini-2.5-pro'),
    messages: [
      {
        role: 'system',
        content: `你是一位专业的健身营养师。请根据用户提供的餐食搭配，进行简短、专业、友好的分析。
        
        请严格按照以下Markdown格式输出：
        
        ### 🥗 总体评价
        [一句话点评这餐的健康程度]
        
        ### ✅ 优点分析
        * [优点1]
        * [优点2]
        
        ### 💡 改进建议
        * [建议1]
        * [建议2]
        
        ### 👥 适用人群
        [说明适合的人群或场景]
        
        语言要通俗易懂，语气要鼓励和积极。`
      },
      ...messages
    ],
  });

  return result.toTextStreamResponse();
}