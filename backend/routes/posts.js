const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { validateId, validatePost } = require('../middleware/validatePost');
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postsController');

const router = express.Router();

router.get('/', asyncHandler(getPosts));
router.get('/:id', validateId, asyncHandler(getPostById));
router.post('/', validatePost, asyncHandler(createPost));
router.put('/:id', validateId, validatePost, asyncHandler(updatePost));
router.delete('/:id', validateId, asyncHandler(deletePost));

module.exports = router;
