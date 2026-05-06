const OpenAI = require('openai');
const config = require('../../config');
const prisma = require('../../utils/prismaClient');
const { AppError } = require('../../middleware/errorHandler');

const openai = new OpenAI({ apiKey: config.openai.apiKey });

const SYSTEM_PROMPT = `You are EduCost AI Advisor — an expert financial counselor specializing in education financing for students worldwide.

You help students understand:
- Education costs and total investment required
- Loan structures, EMI calculations, and repayment strategies
- ROI of their degree based on salary prospects and placement rates
- Financial risk assessment and stress scores
- Scholarship opportunities and cost-reduction strategies
- Comparison of college options based on financial merit

Guidelines:
- Be specific, data-driven, and actionable
- Use concrete numbers when provided
- Always mention risk factors and provide balanced advice
- Suggest alternatives when financial risk is high
- Keep responses under 400 words unless detail is specifically requested
- Format key figures in a clear, readable way`;

class AIService {
  async chat(userId, { message, context = {} }) {
    if (!config.openai.apiKey) throw new AppError('AI service not configured.', 503);

    // Load chat history
    let chatHistory = await prisma.chatHistory.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    const messages = chatHistory ? chatHistory.messagesJson : [];

    // Build context string from provided financial data
    const contextStr = Object.keys(context).length
      ? `\n\nUser's current financial context:\n${JSON.stringify(context, null, 2)}`
      : '';

    const userMessage = { role: 'user', content: `${message}${contextStr}` };
    const messagesToSend = [...messages.slice(-10), userMessage]; // last 10 messages + new

    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messagesToSend],
      temperature: 0.7,
      max_tokens: 600,
    });

    const assistantMessage = {
      role: 'assistant',
      content: response.choices[0].message.content,
    };

    const updatedMessages = [...messages, userMessage, assistantMessage];

    // Persist history
    if (chatHistory) {
      await prisma.chatHistory.update({
        where: { id: chatHistory.id },
        data: { messagesJson: updatedMessages },
      });
    } else {
      await prisma.chatHistory.create({
        data: { userId, messagesJson: updatedMessages },
      });
    }

    return {
      reply: assistantMessage.content,
      usage: response.usage,
      messageCount: updatedMessages.length,
    };
  }

  async getHistory(userId) {
    const history = await prisma.chatHistory.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return history ? history.messagesJson : [];
  }

  async clearHistory(userId) {
    await prisma.chatHistory.deleteMany({ where: { userId } });
    return { cleared: true };
  }
}

module.exports = new AIService();
