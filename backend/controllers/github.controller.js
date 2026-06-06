const { fetchGitHubFile, parseGitHubUrl } = require('../services/github.service');

module.exports.fetchCode = async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'GitHub URL is required.' });

  try {
    const { owner, repo, branch, filePath } = parseGitHubUrl(url);
    const code = await fetchGitHubFile(owner, repo, filePath, branch);

    // Detect language from file extension
    const ext = filePath.split('.').pop().toLowerCase();
    const langMap = {
      js: 'javascript', jsx: 'javascript', ts: 'javascript', tsx: 'javascript',
      py: 'python', java: 'java', c: 'c', cpp: 'cpp', cc: 'cpp', cs: 'javascript',
    };
    const language = langMap[ext] || 'javascript';

    res.json({ success: true, code, language, filePath, repo: `${owner}/${repo}` });
  } catch (error) {
    console.error('GitHub fetch error:', error.message);
    res.status(400).json({ error: error.message });
  }
};
