const express          = require('express');
const githubController = require('../controllers/github.controller');
const router           = express.Router();

router.post('/fetch', githubController.fetchCode);

module.exports = router;
