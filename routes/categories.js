import express from 'express';

import * as authMiddleware from '../middlewares/authMiddleware.js';
import * as categoryController from '../controllers/categoryController.js';

const router = express.Router();

router
  .route('/')
  .get(categoryController.getAllCategory)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    categoryController.createCategory
  );

router.use(authMiddleware.protect);

router
  .route('/:id')
  .get(categoryController.getCategory)
  .patch(
    authMiddleware.restrictTo('admin'),
    categoryController.updateCategory
  )
  .delete(
    authMiddleware.restrictTo('admin'),
    categoryController.deleteCategory
  );

export default router;
