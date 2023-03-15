import express from 'express';

import * as authController from '../controllers/authController.js';
import * as categoryController from '../controllers/categoryController.js';

const router = express.Router();

router
  .route('/')
  .get(categoryController.getAllCategory)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.createCategory
  );

router.use(authController.protect);

router
  .route('/:id')
  .get(categoryController.getCategory)
  .patch(
    authController.restrictTo('admin'),
    categoryController.updateCategory
  )
  .delete(
    authController.restrictTo('admin'),
    categoryController.deleteCategory
  );

export default router;
