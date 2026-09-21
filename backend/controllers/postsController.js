const pool = require('../config/db');

const getPosts = async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, title, content, author, created_at, updated_at FROM posts ORDER BY created_at DESC'
  );
  res.status(200).json(rows);
};

const getPostById = async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, title, content, author, created_at, updated_at FROM posts WHERE id = ?',
    [req.postId]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Post not found' });
  }

  res.status(200).json(rows[0]);
};

const createPost = async (req, res) => {
  const { title, content, author } = req.body;
  const [result] = await pool.execute(
    'INSERT INTO posts (title, content, author) VALUES (?, ?, ?)',
    [title, content, author]
  );

  const [rows] = await pool.execute(
    'SELECT id, title, content, author, created_at, updated_at FROM posts WHERE id = ?',
    [result.insertId]
  );

  res.status(201).json(rows[0]);
};

const updatePost = async (req, res) => {
  const { title, content, author } = req.body;
  const [result] = await pool.execute(
    'UPDATE posts SET title = ?, content = ?, author = ? WHERE id = ?',
    [title, content, author, req.postId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const [rows] = await pool.execute(
    'SELECT id, title, content, author, created_at, updated_at FROM posts WHERE id = ?',
    [req.postId]
  );

  res.status(200).json(rows[0]);
};

const deletePost = async (req, res) => {
  const [result] = await pool.execute('DELETE FROM posts WHERE id = ?', [req.postId]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Post not found' });
  }

  res.status(204).send();
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};
