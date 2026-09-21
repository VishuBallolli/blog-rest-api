const notFound = (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof SyntaxError && err.status === 400 && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must contain valid JSON' });
  }

  res.status(err.statusCode || 500).json({
    error: err.statusCode ? err.message : 'Internal server error'
  });
};

module.exports = { notFound, errorHandler };
