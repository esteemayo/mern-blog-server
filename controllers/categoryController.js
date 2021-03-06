const factory = require('./handlerFactory');
const Category = require('../models/Category');

exports.getAllCategory = factory.getAll(Category);
exports.getCategory = factory.getOneById(Category);
exports.createCategory = factory.createOne(Category);
exports.updateCategory = factory.updateOne(Category);
exports.deleteCategory = factory.deleteOne(Category);
