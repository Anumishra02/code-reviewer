const aiService   = require('../services/ai.service');
const { saveReview } = require('../services/store.service');

module.exports.getReview = async (req, res) => {
  const { code, language } = req.body;

  if (!code || code.trim() === '') {
    return res.status(400).json({ error: 'Code is required.' });
  }

  try {
    const response = await aiService(code, language);

    // Parse out rough bug/opt counts from the markdown text
    const bugCount          = (response.match(/bug|error|issue|❌/gi)          || []).length;
    const optimizationCount = (response.match(/optim|improve|suggest|🧹/gi) || []).length;

    // Save to in-memory store
    saveReview({ code, language: language || 'javascript', review: response, bugCount, optimizationCount });

    res.send(response);
  } catch (error) {
    console.error('❌ AI Error:', error.message);
    res.status(500).json({
      error: error.message,
      hint: error.message.includes('429')
        ? 'API quota exceeded. Create a new API key at aistudio.google.com/apikey'
        : error.message.includes('API_KEY_INVALID')
        ? 'Invalid API key. Check your .env file.'
        : 'Check backend terminal for details.'
    });
  }
};
