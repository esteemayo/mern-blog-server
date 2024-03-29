import Category from '../models/Category.js';
import * as factory from './handlerFactory.js';

export const getAllCategory = factory.getAll(Category);
export const getCategory = factory.getOneById(Category);
export const createCategory = factory.createOne(Category);
export const updateCategory = factory.updateOne(Category);
export const deleteCategory = factory.deleteOne(Category);
