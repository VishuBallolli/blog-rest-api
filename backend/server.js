const express = require('express');
const dotenv = require('dotenv');
const pool = require('./config/db');
const postsRouter = require('./routes/posts');
const asyncHandler = require('./middleware/asyncHandler');
const { notFound, errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();

app.use(express.json());

app.get('/api/health', asyncHandler(async (req, res) => {
  await pool.query('SELECT 1');
  res.status(200).json({ status: 'ok', database: 'connected' });
}));

app.use('/api/posts', postsRouter);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 3000;

if (require.main === module) {
  const server = app.listen(port, () => {
    console.log(`Blog API listening on port ${port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = app;
