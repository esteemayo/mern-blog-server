const express = require('express');

const authController = require('../controllers/authController');
const postController = require('../controllers/postController');

const router = express.Router();

router
  .route('/')
  .get(postController.getAllPosts)
  .post(authController.protect, postController.createPost);

router
  .route('/:id')
  .get(postController.getPostById)
  .patch(authController.protect, postController.updatePost)
  .delete(authController.protect, postController.deletePost);

router.get('/details/:slug', postController.getPostBySlug);

module.exports = router;
