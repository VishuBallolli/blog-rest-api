const validatePost = (req, res, next) => {
  const { title, content, author } = req.body || {};
  const errors = [];

  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push('title is required and must be a non-empty string');
  } else if (title.trim().length > 255) {
    errors.push('title must be 255 characters or fewer');
  }

  if (typeof content !== 'string' || content.trim().length === 0) {
    errors.push('content is required and must be a non-empty string');
  }

  if (typeof author !== 'string' || author.trim().length === 0) {
    errors.push('author is required and must be a non-empty string');
  } else if (author.trim().length > 100) {
    errors.push('author must be 100 characters or fewer');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  req.body = {
    title: title.trim(),
    content: content.trim(),
    author: author.trim()
  };
  next();
};

const validateId = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  req.postId = id;
  next();
};

module.exports = { validatePost, validateId };
