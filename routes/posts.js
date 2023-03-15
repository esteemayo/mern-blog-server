import express from 'express';

import authController from '../controllers/authController.js';
import postController from '../controllers/postController.js';

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
