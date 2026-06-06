const { getHistory, getAnalytics, deleteReview } = require('../services/store.service');

module.exports.getHistory = (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  res.json({ success: true, reviews: getHistory(limit) });
};

module.exports.getAnalytics = (req, res) => {
  res.json({ success: true, analytics: getAnalytics() });
};

module.exports.deleteReview = (req, res) => {
  const { id } = req.params;
  const deleted = deleteReview(id);
  if (!deleted) return res.status(404).json({ error: 'Review not found' });
  res.json({ success: true, message: 'Review deleted' });
};
