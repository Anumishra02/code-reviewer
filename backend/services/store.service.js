// In-memory store — replace with Supabase later
// All data resets when server restarts

const reviews = []; // Array of review objects
let totalRequests = 0;

function saveReview({ code, language, review, bugCount, optimizationCount }) {
  totalRequests++;
  const entry = {
    id:                `rev_${Date.now()}`,
    timestamp:         new Date().toISOString(),
    language:          language || 'unknown',
    codeSnippet:       code.substring(0, 120) + (code.length > 120 ? '...' : ''),
    review,
    bugCount:          bugCount   || 0,
    optimizationCount: optimizationCount || 0,
  };
  reviews.unshift(entry); // newest first
  if (reviews.length > 50) reviews.pop(); // cap at 50
  return entry;
}

function getHistory(limit = 10) {
  return reviews.slice(0, limit);
}

function getAnalytics() {
  const langCount = {};
  let totalBugs   = 0;
  let totalOpts   = 0;

  for (const r of reviews) {
    langCount[r.language] = (langCount[r.language] || 0) + 1;
    totalBugs += r.bugCount;
    totalOpts += r.optimizationCount;
  }

  // Reviews per day (last 7 days)
  const dailyMap = {};
  const now = Date.now();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    dailyMap[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
  }
  for (const r of reviews) {
    const day = new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (day in dailyMap) dailyMap[day]++;
  }

  return {
    totalReviews:    reviews.length,
    totalRequests,
    avgBugsPerReview: reviews.length ? (totalBugs / reviews.length).toFixed(1) : 0,
    avgOptsPerReview: reviews.length ? (totalOpts / reviews.length).toFixed(1) : 0,
    languageBreakdown: Object.entries(langCount).map(([lang, count]) => ({ lang, count })),
    dailyReviews:      Object.entries(dailyMap).map(([date, count]) => ({ date, count })),
  };
}

function deleteReview(id) {
  const idx = reviews.findIndex(r => r.id === id);
  if (idx === -1) return false;
  reviews.splice(idx, 1);
  return true;
}

module.exports = { saveReview, getHistory, getAnalytics, deleteReview };
