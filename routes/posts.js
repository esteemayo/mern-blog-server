import express from 'express';

import * as authMiddleware from '../middlewares/authMiddleware.js';
import * as postController from '../controllers/postController.js';

const router = express.Router();

router
  .route('/')
  .get(postController.getAllPosts)
  .post(authMiddleware.protect, postController.createPost);

router
  .route('/:id')
  .get(postController.getPostById)
  .patch(authMiddleware.protect, postController.updatePost)
  .delete(authMiddleware.protect, postController.deletePost);

router.get('/details/:slug', postController.getPostBySlug);

export default router;
