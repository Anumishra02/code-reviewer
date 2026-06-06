const express           = require('express');
const historyController = require('../controllers/history.controller');
const router            = express.Router();

router.get('/history',       historyController.getHistory);
router.get('/analytics',     historyController.getAnalytics);
router.delete('/history/:id', historyController.deleteReview);

module.exports = router;
