import express from 'express';

import categoryController from '../controllers/categoryController.js';
import authController from '../controllers/authController.js';

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
