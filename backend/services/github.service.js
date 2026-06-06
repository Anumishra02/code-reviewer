// Fetches a file's raw content from a public GitHub repo
// No auth needed for public repos

async function fetchGitHubFile(owner, repo, filePath, branch = 'main') {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;

  const response = await fetch(url);

  if (response.status === 404) {
    // Try 'master' branch as fallback
    const fallback = `https://raw.githubusercontent.com/${owner}/${repo}/master/${filePath}`;
    const res2 = await fetch(fallback);
    if (!res2.ok) {
      throw new Error(`File not found: ${filePath} in ${owner}/${repo}. Check the path and branch.`);
    }
    return await res2.text();
  }

  if (!response.ok) {
    throw new Error(`GitHub fetch failed: ${response.status} ${response.statusText}`);
  }

  const content = await response.text();

  if (content.length > 20000) {
    throw new Error('File too large (max 20KB). Please paste a smaller file.');
  }

  return content;
}

// Parse a GitHub URL into owner/repo/path
// Supports: https://github.com/owner/repo/blob/branch/path/to/file.js
function parseGitHubUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname !== 'github.com') throw new Error('Not a GitHub URL');

    const parts = u.pathname.split('/').filter(Boolean);
    // parts: [owner, repo, 'blob', branch, ...path]
    if (parts.length < 5 || parts[2] !== 'blob') {
      throw new Error('Paste a direct file URL like: github.com/owner/repo/blob/main/file.js');
    }

    const owner    = parts[0];
    const repo     = parts[1];
    const branch   = parts[3];
    const filePath = parts.slice(4).join('/');

    return { owner, repo, branch, filePath };
  } catch (e) {
    if (e.message.includes('Invalid URL')) {
      throw new Error('Invalid URL. Paste a full GitHub file URL.');
    }
    throw e;
  }
}

module.exports = { fetchGitHubFile, parseGitHubUrl };
