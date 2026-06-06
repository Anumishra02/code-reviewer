require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function generateContent(code, language = 'javascript') {
  const key = process.env.GOOGLE_GEMINI_KEY;
  if (!key) throw new Error('GOOGLE_GEMINI_KEY is missing from .env');

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are an expert code reviewer. For each ${language} code snippet provide:
1. Overall Rating: ✅ Good / ⚠️ Average / ❌ Poor with brief reason.
2. Issues & Improvements as bullet points with 🧹 Issue and Improvement for each.
3. A corrected code snippet if needed.
4. One line of Summary Advice.
Be concise, specific, and constructive.`
  });

  const result = await model.generateContent(code);
  return result.response.text();
}

module.exports = generateContent;
