import factory from './handlerFactory.js';
import Category from '../models/Category.js';

export const getAllCategory = factory.getAll(Category);
export const getCategory = factory.getOneById(Category);
export const createCategory = factory.createOne(Category);
export const updateCategory = factory.updateOne(Category);
export const deleteCategory = factory.deleteOne(Category);
