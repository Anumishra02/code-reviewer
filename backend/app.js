require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const aiRoutes       = require('./routes/ai.routes');
const historyRoutes  = require('./routes/history.routes');
const githubRoutes   = require('./routes/github.routes');
const rateLimiter    = require('./middleware/rateLimiter');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Apply rate limiter only to AI review endpoint
app.use('/ai/get-review', rateLimiter);

app.get('/', (req, res) => {
  res.json({ status: 'CodeSense AI Backend Running', version: '2.0' });
});

app.use('/ai',      aiRoutes);
app.use('/data',    historyRoutes);
app.use('/github',  githubRoutes);

module.exports = app;
