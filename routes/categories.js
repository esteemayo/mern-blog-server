const express = require('express');

const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');

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
  .patch(authController.restrictTo('admin'), categoryController.updateCategory)
  .delete(
    authController.restrictTo('admin'),
    categoryController.deleteCategory
  );

module.exports = router;
